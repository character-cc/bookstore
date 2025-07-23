using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Users;

namespace Backend.Services.Shipping;

public interface IShippingService
{
    Task<int> CreateOrderAsync(object payload);

    Task<ShippingFeeResult> CalculateCheapestShippingFeeAsync(int userId, Address address);

}
