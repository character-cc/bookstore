using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Products.Enum;
using Backend.DTO.Discounts;
using Backend.DTO.Orders;
using Backend.Services.Discounts;
using Backend.Services.Email;
using Backend.Services.Orders;
using Backend.Services.Products;
using Backend.Services.Stores;
using Backend.Services.Users;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Backend.Controllers;

public class OrderController : PublicController 
{
    private readonly IOrderService _orderService;

    private readonly ICheckoutService _checkoutService;

    private readonly IDiscountService _discountService;

    private readonly IUserService _userService;

    private readonly IEmailSender _emailSender;

    private readonly IEmailTemplateService _emailTemplateService;

    private readonly IBookService _bookService;

    private readonly IStoreService _storeService;

    private readonly IMapper _mapper;


    public OrderController(
        IOrderService orderService,
        ICheckoutService checkoutService,
        IDiscountService discountService,
        IUserService userService,
        IEmailSender emailSender,
        IEmailTemplateService emailTemplateService,
        IBookService bookService,
        IStoreService storeService,
        IMapper mapper)
    {
        _orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
        _checkoutService = checkoutService ?? throw new ArgumentNullException(nameof(checkoutService));
        _discountService = discountService ?? throw new ArgumentNullException(nameof(discountService));
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        _emailTemplateService = emailTemplateService ?? throw new ArgumentNullException(nameof(emailTemplateService));
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService));
        _storeService = storeService ?? throw new ArgumentNullException(nameof(storeService));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    [HttpGet("orders/{orderId}")]
    public async Task<IActionResult> GetOrderDetails(int orderId)
    {

        var order = await _orderService.GetOrderByIdAsync(orderId);
        if (order == null)
            return NotFound("Order not found.");
        var orderDto = _mapper.Map<OrderDto>(order);
        return Ok(orderDto);
    }

    [HttpPut("orders/{orderId}")]
    public async Task<IActionResult> UpdateOrder([FromRoute] int orderId, [FromBody] UpdateOrderRequest updateOrderRequest)
    {
        if (updateOrderRequest == null)
            return BadRequest("Order data is required.");
        var order = await _orderService.GetOrderByIdAsync(orderId);
        if (order == null)
            return NotFound("Order not found.");
        var previousStatus = order.Status;
        order.Status = updateOrderRequest.Status;
        if(order.Status == "Completed")
        {
            order.IsPaid = true;
        }
        else if (order.Status == "Cancelled")
        {
            order.IsPaid = false;
        }
        await _orderService.UpdateOrderAsync(order);
        var tracking = _mapper.Map<List<ShippingTracking>>(updateOrderRequest.ShippingTrackings);
        var trackingUpdate = tracking.Select(t =>
        {
            t.OrderId = orderId;
            return t;
        }).ToList();
        await _orderService.UpdateShippingTrackingsAsync(orderId, trackingUpdate);
        if(order.Status == OrderStatus.Cancelled.ToString() && previousStatus != OrderStatus.Cancelled.ToString())
        {
            //var discount = await _discountService.GetDiscountByCodeAsync(order.DiscountCode);
            var discount = await _discountService.GetDiscountByIdAsync(order.DiscountId);
            if (discount != null)
            {
                discount.CurrentUsageCount--;
                await _discountService.UpdateDiscountAsync(discount);
            }
        }
        if (order.Status != OrderStatus.Cancelled.ToString() && previousStatus == OrderStatus.Cancelled.ToString())
        {
            var discount = await _discountService.GetDiscountByIdAsync(order.DiscountId);
            if (discount != null)
            {
                discount.CurrentUsageCount++;
                await _discountService.UpdateDiscountAsync(discount);
            }
        }
        await _orderService.UpdateInventoryBasedOnOrderStatusChangeAsync(order, previousStatus);
        return Ok(new {message = " Thành công"});
    }

    [HttpGet("orders/me")]
    public async Task<IActionResult> GetMyOrders([FromQuery] string status = "")
    {
        var userId = GetUserId();
        var orders = await _orderService.GetOrdersByUserIdAsync(userId,status);
        var orderDtos = orders.Select(o => _mapper.Map<OrderDto>(o)).ToList();
        return Ok(orderDtos);
    }

    [HttpPost("orders/me")]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
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
        var address = await _userService.GetAddressByAddressIdAsync(request.AddressId);
        var transId = new Random().Next(1000000);
        var appTransId = $"{DateTime.Now:yyMMdd}_{transId}";
        await _orderService.DeleteOrderNotCompletedAsync(userId);
        var store = await _storeService.GetStoreAsync();
        var o = new Order
        {
            UserId = userId,
            ShippingAddress = address.FullAddress,
            CustomerName = address.RecipientName,
            CustomerPhone = address.RecipientPhone,
            TransactionId = appTransId,
            Status = OrderStatus.Pending.ToString(),
            IsComplete = true,
            DiscountId = discount?.Id ?? 0,
            DiscountCode = discount?.Code,
            //StoreId = request.StoreId,
            ShippingFee = request.TotalShippingFee,
            DiscountAmount = result.DiscountAmount,
            TotalAmount = result.TotalAfterDiscount + request.TotalShippingFee
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
        var totalCostPrice = 0.0m;
        o.Items = orderItems;
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
     
                await _bookService.SubtractStockWithTrackingAsync(o.Id , book.Id, item.Quantity);
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
        o.TotalBaseCost = totalCostPrice + cartItemsOfCheckout.Sum(ci => ci.BookAttributePriceAdjustment);
        await _orderService.InsertOrderItemsAsync(orderItems);
        await _orderService.UpdateOrderAsync(o);
        if (discount != null)
        {
            discount.CurrentUsageCount++;
            await _discountService.UpdateDiscountAsync(discount);
        }
        var html = await _emailTemplateService.RenderNewOrderNotificationEmailAsync(o);

        await _emailSender.SendEmailAsync(store.Email, "Có Đơn hàng mới", html);
        return Ok(new { message = "Tạo đơn hàng thành công" });
    }


}
