using Backend.Common;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Users;
using Backend.DTO.Discounts;
using Backend.DTO.Products;
using System.Linq.Expressions;

namespace Backend.Services.Discounts;

public interface IDiscountService
{
    Task<List<Discount>> GetAllDiscountsPublicAsync();
    Task<List<Discount>> GetRandomDiscountsAsync();
    Task DeleteDiscountAsync(Discount discount);
    Task<IPagedList<Discount>> GetDiscountsAsync(
    string code = null,
    DateTime? startDate = null,
    DateTime? endDate = null,
    Expression<Func<Discount, object>>? orderBy = null,
    bool orderDesc = false,
    int pageIndex = 0,
    int pageSize = 20);

    Task<IList<Book>> SearchBooksForDiscountAsync(
    string keyword,
    int? discountId = null,
    bool isSelectingForApplicable = true,
    int pageIndex = 0,
    int pageSize = 20);

    Task<Discount> GetDiscountByIdAsync(int discountId);

    Task<List<Role>> GetSelectedRolesAsync(int discountId);

    Task<List<Book>> GetApplicableBooksAsync(int discountId);

    Task<List<Book>> GetExcludedBooksAsync(int discountId);

    Task<int> CreateDiscountAsync(DiscountCreateOrUpdateDto dto);
    Task UpdateDiscountAsync(int discountId, DiscountCreateOrUpdateDto dto);

    Task UpdateDiscountAsync(Discount discount);

    Task<IList<Discount>> GetAvailableDiscountsAsync(int userId, decimal totalAmount, List<CartItem> cartItems);

    Task<DiscountCalculationResult> CalculateDiscountAsync(string code, List<int> cartItemIds, int userId);

    Task<Discount> GetDiscountByCodeAsync(string code);

    Task<decimal> CalculateCartTotalAsync(List<CartItem> cartItems);
}
