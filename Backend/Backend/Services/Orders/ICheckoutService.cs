using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Discounts;

namespace Backend.Services.Orders;

public interface ICheckoutService
{
    Task CreateCheckoutAsync(int userId, List<int> bookIds, string discountCode);

    Task<IList<CartItem>> GetCartItemsOfCheckout(int userId);


    Task<Discount> GetDiscountByUserIdAsync(int userId);
}
