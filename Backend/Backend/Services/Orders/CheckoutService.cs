using Backend.Data;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Orders;
using LinqToDB;

namespace Backend.Services.Orders;

public class CheckoutService : ICheckoutService
{
    private readonly IRepository<CheckoutItem> _checkoutRepository;

    private readonly IRepository<CartItem> _cartItemRepository;

    private readonly IRepository<Discount> _discountRepository;

    public CheckoutService(IRepository<CheckoutItem> checkoutRepository, IRepository<CartItem> cartItemRepository, IRepository<Discount> discountRepository)
    {
        _checkoutRepository = checkoutRepository ?? throw new ArgumentNullException(nameof(checkoutRepository), "Checkout repository is not initialized.");
        _cartItemRepository = cartItemRepository ?? throw new ArgumentNullException(nameof(cartItemRepository), "Cart item repository is not initialized.");
        _discountRepository = discountRepository ?? throw new ArgumentNullException(nameof(discountRepository), "Discount repository is not initialized.");
    }


    public async Task CreateCheckoutAsync(int userId, List<int> cartItemIds, string discountCode)
    {
        if (cartItemIds == null || cartItemIds.Count == 0)
        {
            throw new ArgumentException("Book IDs cannot be null or empty.", nameof(cartItemIds));
        }
        await _checkoutRepository.EntitySet.Where(c => c.UserId == userId).DeleteAsync();
        var discountId = await _discountRepository.EntitySet
            .Where(d => d.IsActive && d.StartDate <= DateTime.UtcNow && d.EndDate >= DateTime.UtcNow && d.Code == discountCode && d.IsDeleted == false)
            .Select(d => d.Id)
            .FirstOrDefaultAsync();
        var cartItems = await _cartItemRepository.EntitySet
            .Where(ci => ci.UserId == userId && cartItemIds.Contains(ci.Id))
            .ToListAsync();
        var checkoutItems = cartItemIds.Select(cartItemId => new CheckoutItem
        {
            UserId = userId,
            CartItemId = cartItemId,
            DiscountId = discountId ,
        }).ToList();
        await _checkoutRepository.InsertAsync(checkoutItems);
    }

    public async Task<IList<CartItem>> GetCartItemsOfCheckout(int userId)
    {
        if (userId <= 0)
            throw new ArgumentException("ID người dùng không hợp lệ", nameof(userId));
        var cartItemIds = await _checkoutRepository.EntitySet
            .Where(c => c.UserId == userId)
            .Select(c => c.CartItemId)
            .ToListAsync();
        var query = _cartItemRepository.EntitySet
            .LoadWith(ci => ci.Book).ThenLoad(b => b.Images)
            .LoadWith(ci => ci.Book).ThenLoad(b => b.Authors)
            .LoadWith(ci => ci.BookAttributeValues)
            .Where(ci => ci.UserId == userId && cartItemIds.Contains(ci.Id))
            .OrderByDescending(ci => ci.UpdatedAt);
        return await query.ToListAsync();
    }

  
    public async Task<Discount> GetDiscountByUserIdAsync(int userId)
    {
        if (userId <= 0)
            throw new ArgumentException("ID người dùng không hợp lệ", nameof(userId));
       
        var discountId = await _checkoutRepository.EntitySet
            .Where(c => c.UserId == userId)
            .Select(c => c.DiscountId)
            .FirstOrDefaultAsync();
        var discount = await _discountRepository.EntitySet
            .Where(d => d.IsDeleted == false && d.Id == discountId && d.IsActive && d.StartDate <= DateTime.UtcNow && d.EndDate >= DateTime.UtcNow)
            .FirstOrDefaultAsync();
        return discount;
    }
}
