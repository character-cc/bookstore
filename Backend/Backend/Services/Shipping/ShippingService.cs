using System.Text;
using Azure.Core;
using Backend.Data;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Stores;
using Backend.Data.Domain.Users;
using LinqToDB;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Backend.Data.Domain.Cart;
using Newtonsoft.Json.Linq;

namespace Backend.Services.Shipping;

public class ShippingService : IShippingService
{
    private readonly HttpClient _httpClient;

    private readonly ShippingOptions _options;

    private readonly IRepository<StoreBook> _storeBookRepository;

    private readonly IRepository<Store> _storeRepository;

    private readonly IRepository<CheckoutItem> _checkoutItemRepository;

    private readonly IRepository<CartItem> _cartItemRepository;

    public ShippingService(HttpClient httpClient, IOptions<ShippingOptions> options, IRepository<StoreBook> storeBookRepository, IRepository<Store> storeRepository, IRepository<CheckoutItem> checkoutItemRepository, IRepository<CartItem> cartItemRepository)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _storeBookRepository = storeBookRepository;
        _storeRepository = storeRepository;
        _checkoutItemRepository = checkoutItemRepository;
        _cartItemRepository = cartItemRepository;
    }

    public async Task<int> CreateOrderAsync(object payload)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee")
        {
            Content = new StringContent(
                JsonConvert.SerializeObject(payload),
                Encoding.UTF8,
                "application/json"
            )
        };

        request.Headers.Add("token", _options.Token);
        request.Headers.Add("shop_id", _options.ShopId);

        var response = await _httpClient.SendAsync(request);

        var result = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Shipping API failed: {response.StatusCode} - {result}");

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Shipping API failed: {response.StatusCode} - {result}");

        var json = JObject.Parse(result);
        int total = json["data"]?["total"]?.Value<int>() ?? throw new Exception("Không tìm thấy total");

        return total;
        
    }


    public async Task<ShippingFeeResult> CalculateCheapestShippingFeeAsync(int userId, Address address)
    {
        var store = await _storeRepository.EntitySet
            .Where(s => s.IsActive)
            .FirstOrDefaultAsync();

        if (store == null)
            return null;

        var cartItemIds = await _checkoutItemRepository.EntitySet
            .Where(ci => ci.UserId == userId)
            .Select(ci => ci.CartItemId)
            .ToListAsync();

        var cartItems = await _cartItemRepository.EntitySet
            .Where(ci => cartItemIds.Contains(ci.Id))
            .LoadWith(ci => ci.Book)
            .ToListAsync();

        var books = cartItems.Select(ci => ci.Book).ToList();

        var totalWeight = 0;
        var length = 0;
        var width = 0;
        var height = 0;

        foreach (var book in books)
        {
            totalWeight += book.Weight;
            length = Math.Max(length, book.Length);
            width = Math.Max(width, book.Width);
            height = Math.Max(height, book.Height);
        }

        var payload = new
        {
            service_type_id = 2,
            from_district_id = store.DistrictId,
            from_ward_code = store.WardId.ToString(),
            to_district_id = address.DistrictId,
            to_ward_code = address.WardId.ToString(),
            weight = totalWeight,
            length,
            width,
            height,
            cod_value = 0
        };

        try
        {
            var fee = await CreateOrderAsync(payload);

            return new ShippingFeeResult
            {
                StoreId = store.Id,
                TotalShippingFee = fee
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error calculating shipping fee: {ex.Message}");
            return null;
        }
    }


   

}
