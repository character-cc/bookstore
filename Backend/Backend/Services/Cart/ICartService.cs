using Backend.Data.Domain.Cart;

namespace Backend.Services.Cart;

public interface ICartService
{
    Task DeleteCartItemAsync(int cartItemId);
    Task<bool> AddToCartAsync(int currentUserId, int bookId, int quantity, List<int> attributeValueIds);

    Task<IList<CartItem>> GetCartItemsAsync(int userId);

    Task<bool> UpdateQuantityCartAsync(int cartItemId, int quantity);

    Task<List<CartItem>> GetCartItemsByIdsAsync(int userId, List<int> cartItemIds);
}
