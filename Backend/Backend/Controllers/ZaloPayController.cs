using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Users;
using Backend.Data.Domain.Users.Enum;
using Backend.DTO.Discounts;
using Backend.DTO.Orders;
using Backend.DTO.Users;
using Backend.Services.Discounts;
using Backend.Services.Email;
using Backend.Services.Orders;
using Backend.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Backend.Services.Products;
using Backend.Services.Stores;
using Azure.Core;


namespace Backend.Controllers;

[Route("[controller]")]

public class ZaloPayController : PublicController
{
    private readonly IHttpClientFactory _httpClientFactory;

    private readonly ICheckoutService _checkoutService;

    private readonly IDiscountService _discountService;

    private readonly IOrderService _orderService;

    private readonly IUserService _userService;

    private readonly IMapper _mapper;

    private readonly IEmailSender _emailSender;

    private readonly IEmailTemplateService _emailTemplateService;

    private readonly IBookService _bookService;

    private readonly IStoreService _storeService;


    public ZaloPayController(
        IHttpClientFactory httpClientFactory,
        ICheckoutService checkoutService,
        IDiscountService discountService,
        IOrderService orderService,
        IUserService userService,
        IMapper mapper,
        IEmailSender emailSender,
        IEmailTemplateService emailTemplateService,
        IBookService bookService,
        IStoreService storeService)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _checkoutService = checkoutService ?? throw new ArgumentNullException(nameof(checkoutService));
        _discountService = discountService ?? throw new ArgumentNullException(nameof(discountService));
        _orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        _emailTemplateService = emailTemplateService ?? throw new ArgumentNullException(nameof(emailTemplateService));
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService));
        _storeService = storeService ?? throw new ArgumentNullException(nameof(storeService));
    }

    private readonly string app_id = "2553";
    private readonly string key1 = "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
    private readonly string key2 = "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz";
    private readonly string endpoint = "https://sb-openapi.zalopay.vn/v2/create";

    [HttpPost("payment")]
    public async Task<IActionResult> CreatePayment([FromBody] OrderRequest orderZaloRequest)
    {
        int userId = GetUserId();
        var cartItemsOfCheckout = await _checkoutService.GetCartItemsOfCheckout(userId);
        var cartItemsIds = cartItemsOfCheckout.Select(ci => ci.Id).ToList();
        var discount = await _checkoutService.GetDiscountByUserIdAsync(userId);
        var result = new DiscountCalculationResult();
        if (discount == null)
        {

            var total = await _discountService.CalculateCartTotalAsync(cartItemsOfCheckout.ToList());
            result = new DiscountCalculationResult
            {
                IsValid = true,
                Message = "",
                DiscountCode = null,
                TotalBeforeDiscount = total,
                DiscountableAmount = 0,
                DiscountAmount = 0
            };

        }
        else
        {
            result = await _discountService.CalculateDiscountAsync(discount?.Code, cartItemsIds, userId);
        }
        var address = await _userService.GetAddressByAddressIdAsync(orderZaloRequest.AddressId);
        var transId = new Random().Next(1000000);
        var appTransId = $"{DateTime.Now:yyMMdd}_{transId}";
        await _orderService.DeleteOrderNotCompletedAsync(userId);
        var o = new Order
        {
            UserId = userId,
            ShippingAddress = address.FullAddress,
            CustomerName = address.RecipientName,
            CustomerPhone = address.RecipientPhone,
            TransactionId = appTransId,
            Status = OrderStatus.Pending.ToString(),
            IsComplete = false,
            DiscountCode = discount?.Code,
            DiscountId = discount?.Id ?? 0,
            //StoreId = request.StoreId,
            ShippingFee = orderZaloRequest.TotalShippingFee,
            DiscountAmount = result.DiscountAmount,
            TotalAmount = result.TotalAfterDiscount + orderZaloRequest.TotalShippingFee
        };
        
        await _orderService.InsertOrderAsync(o);
        var orderItems = cartItemsOfCheckout.Select(ci => new OrderItem
        {
            OrderId = o.Id,
            BookId = ci.BookId,
            BookName = ci.Book.Name,
            PictureUrl = ci.Book.Images.FirstOrDefault()?.ImageUrl,
            ShortDescription = ci.Book.ShortDescription,
            SelectedAttributes = JsonConvert.SerializeObject(ci.BookAttributeValues),
            Quantity = ci.Quantity,
            UnitPrice = ci.ItemPrice,
        }).ToList();
        await _orderService.InsertOrderItemsAsync(orderItems);

        o.TotalBaseCost += cartItemsOfCheckout.Sum(ci => ci.BookAttributePriceAdjustment);
        var appTime = DateTimeOffset.Now.ToUnixTimeMilliseconds();

        var embedData = new { redirecturl = "http://localhost/order-success" };
        var items = new List<object>();
        var amount = (long) o.TotalAmount;
        var order = new Dictionary<string, object>
        {
            { "app_id", app_id },
            { "app_trans_id", appTransId },
            { "app_user", "user123" },
            { "app_time", appTime },
            { "item", JsonConvert.SerializeObject(items) },
            { "embed_data", JsonConvert.SerializeObject(embedData) },
            { "amount", amount },
            { "callback_url", "https://arriving-nicely-lamb.ngrok-free.app/api/zalopay/callback" },
            { "description", $"Thanh toán của nhà sách trí tuê" },
            { "bank_code", "" }
        };

        var dataStr = $"{app_id}|{appTransId}|user123|{amount}|{appTime}|{order["embed_data"]}|{order["item"]}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key1));
        var mac = BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(dataStr))).Replace("-", "").ToLower();
        order["mac"] = mac;

        var client = _httpClientFactory.CreateClient();
        var content = new FormUrlEncodedContent(order.ToDictionary(k => k.Key, k => k.Value.ToString()));

        var response = await client.PostAsync(endpoint, content);
        var r = await response.Content.ReadAsStringAsync();
        //var json = JsonConvert.DeserializeObject<object>(result);
        return Ok(r);
    }

    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromBody] ZalopayCallbackRequest body)
    {
        try
        {
            var data = body.Data;
            var mac = body.Mac;

            var dataObj = JsonConvert.DeserializeObject<Dictionary<string, object>>(data);

            var callbackData = $"{dataObj["app_id"]}|{dataObj["app_trans_id"]}|{dataObj["app_user"]}|{dataObj["amount"]}|{dataObj["app_time"]}|{dataObj["embed_data"]}|{dataObj["item"]}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key2)); 
            var computedMac = BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(callbackData))).Replace("-", "").ToLower();

            //if (mac != computedMac)
            //{
            //    return Ok(new { return_code = -1, return_message = "mac not equal" });
            //}

            var dataJson = JsonConvert.DeserializeObject<Dictionary<string, object>>(data);
            var transId = dataJson["app_trans_id"];
            var order = await _orderService.GetOrderByTransactionIdAsync(transId.ToString());
            var orderItems = order.Items.ToList();
            if (order == null)
            {
                return Ok(new { return_code = -1, return_message = "order not found" });
            }
            order.IsComplete = true;
            order.Status = OrderStatus.Pending.ToString();
            order.IsPaid = true;
            await _orderService.UpdateOrderAsync(order);
            var discount = await _discountService.GetDiscountByIdAsync(order.DiscountId);
            if (discount != null)
            {
                discount.CurrentUsageCount++;
                await _discountService.UpdateDiscountAsync(discount);
            }
            var totalCostPrice = 0.0m;
            var store = await _storeService.GetStoreAsync();
            foreach (var item in orderItems)
            {
                var book = await _bookService.GetBookAsync(item.BookId);

                if (book == null)
                    continue;
                var p = await _bookService.CalculateTotalCostPriceAsync(book.Id, item.Quantity);
                totalCostPrice += p;
                item.TotalCostPrice = p;
                if (book.InventoryManagementMethodType == InventoryManagementMethodType.SimpleTracking)
                {
                    //book.StockQuantity -= item.Quantity;
                    //totalCostPrice += await _bookService.CalculateTotalCostPriceAsync(book.Id, item.Quantity);
                    await _bookService.SubtractStockWithTrackingAsync(order.Id, book.Id, item.Quantity);

                    await _bookService.SubtractStockAsync(book.Id, item.Quantity);

                    await _bookService.UpdateBookAsync(book);
                    if (await _bookService.GetStockQuantityAsync(book.Id) < book.LowStockThreshold)
                    {
                        var t = new List<Book> { book };
                        var h = await _emailTemplateService.RenderLowStockEmailAsync(t);
                        await _emailSender.SendEmailAsync(store.Email, "Thông báo hàng tồn kho thấp", h);
                    }

                }
            }
            order.TotalBaseCost += totalCostPrice;
            await _orderService.UpdateOrderAsync(order);
            await _orderService.UpdateOrderItemsAsync(orderItems);
            Console.WriteLine($"update order's status = success where app_trans_id = {transId}");
            var html = await _emailTemplateService.RenderNewOrderNotificationEmailAsync(order);
    
            await _emailSender.SendEmailAsync(store.Email , "Có Đơn hàng mới", html);
            return Ok(new { return_code = 1, return_message = "success" });
        }
        catch (Exception ex)
        {
            return Ok(new { return_code = 0, return_message = ex.Message });
        }
    }

    [HttpPost("check-status-order")]
    public async Task<IActionResult> CheckStatus([FromBody] Dictionary<string, string> req)
    {
        var appTransId = req["app_trans_id"];
        var data = $"{app_id}|{appTransId}|{key1}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key1));
        var mac = BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).Replace("-", "").ToLower();

        var body = new Dictionary<string, string>
        {
            { "app_id", app_id },
            { "app_trans_id", appTransId },
            { "mac", mac }
        };

        var client = _httpClientFactory.CreateClient();
        var content = new FormUrlEncodedContent(body);
        var response = await client.PostAsync("https://sb-openapi.zalopay.vn/v2/query", content);
        var result = await response.Content.ReadAsStringAsync();

        return Ok(result);
    }
}
