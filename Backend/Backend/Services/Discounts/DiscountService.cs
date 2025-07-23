using AutoMapper;
using Backend.Common;
using Backend.Data;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Users;
using Backend.DTO.Discounts;
using Backend.DTO.Products;
using Backend.DTO.Roles;
using LinqToDB;
using LinqToDB.DataProvider;
using System.Linq.Expressions;

namespace Backend.Services.Discounts;

public class DiscountService : IDiscountService
{
    private readonly IRepository<Discount> _discountRepository;

    private readonly IRepository<Book> _bookRepository;

    private readonly IRepository<ApplicableDiscountBook> _applicableDiscountBookRepository;

    private readonly IRepository<ExcludedDiscountBook> _excludedDiscountBookRepository;

    private readonly IRepository<DiscountRole> _discountRoleRepository;

    private readonly IRepository<Role> _roleRepository;

    private readonly IRepository<CartItem> _cartItemRepository;

    private readonly IRepository<Order> _orderRepository;
    
    private readonly IRepository<UserRole> _userRoleRepository;

    private readonly IRepository<AttributeValue> _attributeValueRepository;

    private readonly IMapper _mapper;

    public DiscountService(IRepository<Discount> discountRepository, IRepository<Book> bookRepository, IRepository<ApplicableDiscountBook> applicableDiscountBookRepository, IRepository<ExcludedDiscountBook> excludedDiscountBookRepository, IRepository<DiscountRole> discountRoleRepository, IRepository<Role> roleRepository, IRepository<CartItem> cartItemRepository, IRepository<Order> orderRepository, IRepository<UserRole> userRoleRepository, IRepository<AttributeValue> attributeValueRepository, IMapper mapper)
    {
        _discountRepository = discountRepository;
        _bookRepository = bookRepository;
        _applicableDiscountBookRepository = applicableDiscountBookRepository;
        _excludedDiscountBookRepository = excludedDiscountBookRepository;
        _discountRoleRepository = discountRoleRepository;
        _roleRepository = roleRepository;
        _cartItemRepository = cartItemRepository;
        _orderRepository = orderRepository;
        _userRoleRepository = userRoleRepository;
        _attributeValueRepository = attributeValueRepository;
        _mapper = mapper;
    }

    public async Task<IPagedList<Discount>> GetDiscountsAsync(
    string code = null,
    DateTime? startDate = null,
    DateTime? endDate = null,
    Expression<Func<Discount, object>>? orderBy = null,
    bool orderDesc = false,
    int pageIndex = 0,
    int pageSize = 20)
    {
        var query = _discountRepository.EntitySet;

        if (!string.IsNullOrWhiteSpace(code))
            query = query.Where(d => d.Code.Contains(code) || d.Description.Contains(code));

        if (startDate.HasValue)
            query = query.Where(d => d.StartDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(d => d.EndDate <= endDate.Value);

        query = query.Where(d => d.IsDeleted == false).OrderByDescending(d => d.UpdatedAt);

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }

    //public async Task<IList<Book>> SearchBooksForDiscountAsync(
    //string keyword,
    //int? discountId = null,
    //bool isSelectingForApplicable = true, 
    //int pageIndex = 0,
    //int pageSize = 20)
    //{
    //    var query = _bookRepository.EntitySet.LoadWith(b => b.Images)
    //        .LoadWith(b => b.Authors).Where(b => !b.IsDeleted);

    //    if (!string.IsNullOrWhiteSpace(keyword))
    //    {
    //        query = query.Where(b =>
    //            b.Name.Contains(keyword) ||
    //            b.Isbn.Contains(keyword));
    //    }

    //    if (discountId.HasValue)
    //    {
    //        var applicableQuery = _applicableDiscountBookRepository
    //            .EntitySet
    //            .Where(x => x.DiscountId == discountId.Value)
    //            .Select(x => x.BookId);

    //        var excludedQuery = _excludedDiscountBookRepository
    //            .EntitySet
    //            .Where(x => x.DiscountId == discountId.Value)
    //            .Select(x => x.BookId);

    //        if (isSelectingForApplicable)
    //        {
    //            query = query.Where(b =>
    //                !applicableQuery.Contains(b.Id) &&
    //                !excludedQuery.Contains(b.Id));
    //        }
    //        else
    //        {
    //            query = query.Where(b =>
    //                !excludedQuery.Contains(b.Id) &&
    //                !applicableQuery.Contains(b.Id));
    //        }
    //    }

    //    var pagedBooks = await query
    //        .OrderBy(b => b.Name)
    //        .Skip(pageIndex * pageSize)
    //        .Take(pageSize)
    //        .ToListAsync();

    //    return pagedBooks;
    //}

    public async Task<IList<Book>> SearchBooksForDiscountAsync(
    string keyword,
    int? discountId = null,
    bool isSelectingForApplicable = true,
    int pageIndex = 0,
    int pageSize = 20)
    {
        var query = _bookRepository.EntitySet
            .LoadWith(b => b.Images)
            .LoadWith(b => b.Authors)
            .Where(b => !b.IsDeleted);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(b =>
                b.Name.Contains(keyword) ||
                b.Isbn.Contains(keyword));
        }

        if (discountId.HasValue)
        {
            var applicableQuery = _applicableDiscountBookRepository
                .EntitySet
                .Where(x => x.DiscountId == discountId.Value)
                .Select(x => x.BookId);

            query = query.Where(b => !applicableQuery.Contains(b.Id));
        }

        var pagedBooks = await query
            .OrderBy(b => b.Name)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return pagedBooks;
    }

    public async Task<List<Role>> GetSelectedRolesAsync(int discountId)
    {
        var query = from dr in _discountRoleRepository.EntitySet
                    join r in _roleRepository.EntitySet on dr.RoleId equals r.Id
                    where dr.DiscountId == discountId
                    select r;


        return await query.ToListAsync();
    }

    public async Task<List<Book>> GetApplicableBooksAsync(int discountId)
    {
        var query = from ab in _applicableDiscountBookRepository.EntitySet
                    join b in _bookRepository.EntitySet on ab.BookId equals b.Id
                    where ab.DiscountId == discountId
                    select b;

        return await query.ToListAsync();
    }

    public async Task<List<Book>> GetExcludedBooksAsync(int discountId)
    {
        var query = from eb in _excludedDiscountBookRepository.EntitySet
                    join b in _bookRepository.EntitySet on eb.BookId equals b.Id
                    where eb.DiscountId == discountId
                    select b;

        return await query.ToListAsync();
    }

    public async Task<int> CreateDiscountAsync(DiscountCreateOrUpdateDto dto)
    {
        var discount = _mapper.Map<Discount>(dto);

        await _discountRepository.InsertAsync(discount);

        await UpdateRelationsAsync(discount.Id, dto);
        return discount.Id;
    }

    public async Task UpdateDiscountAsync(int discountId, DiscountCreateOrUpdateDto dto)
    {
        var discount = await _discountRepository.EntitySet.Where(d => d.Id == discountId).FirstOrDefaultAsync();
        if (discount == null)
            throw new Exception("Discount not found");

        _mapper.Map(dto, discount);

        await _discountRepository.UpdateAsync(discount);

        await UpdateRelationsAsync(discount.Id, dto);
    }

    private async Task UpdateRelationsAsync(int discountId, DiscountCreateOrUpdateDto dto)
    {
        await _discountRoleRepository.EntitySet.DeleteAsync(x => x.DiscountId == discountId);
        await _applicableDiscountBookRepository.EntitySet.DeleteAsync(x => x.DiscountId == discountId);
        await _excludedDiscountBookRepository.EntitySet.DeleteAsync(x => x.DiscountId == discountId);

        //var newRoles = dto.RoleIds.Select(rid => new DiscountRole { DiscountId = discountId, RoleId = rid });
        var newApplicable = dto.ApplicableBookIds.Select(bid => new ApplicableDiscountBook { DiscountId = discountId, BookId = bid });
        //var newExcluded = dto.ExcludedBookIds.Select(bid => new ExcludedDiscountBook { DiscountId = discountId, BookId = bid });

        //if (newRoles != null && newRoles.Any())
        //{
        //await _discountRoleRepository.InsertAsync(newRoles);

        //}
        if (newApplicable != null && newApplicable.Any())
        {
            await _applicableDiscountBookRepository.InsertAsync(newApplicable);
        }
        //if (newExcluded != null && newExcluded.Any())
        //{

        //    await _excludedDiscountBookRepository.InsertAsync(newExcluded);
        //}

    }

    public async Task<List<Discount>> GetAllDiscountsPublicAsync()
    {
        return await _discountRepository.EntitySet
            .Where(d => d.IsPublic && d.IsActive && d.IsDeleted == false &&
                        d.StartDate <= DateTime.UtcNow &&
                        d.EndDate >= DateTime.UtcNow &&
                        (d.TotalUsageLimit == null || d.CurrentUsageCount < d.TotalUsageLimit))
            .ToListAsync();
    }
    public async Task<List<Discount>> GetRandomDiscountsAsync()
    {
        var now = DateTime.UtcNow;
        var discounts = await _discountRepository.EntitySet
            .Where(d => d.IsPublic && d.IsActive && d.IsDeleted == false &&
                        d.StartDate <= now &&
                        d.EndDate >= now &&
                        (d.TotalUsageLimit == null || d.CurrentUsageCount < d.TotalUsageLimit))
            .ToListAsync();
        return discounts.OrderBy(d => Guid.NewGuid()).Take(3).ToList();
    }
    public async Task<IList<Discount>> GetAvailableDiscountsAsync(
    int userId,
    decimal totalAmount,
    List<CartItem> cartItems)
    {
        var bookIds = cartItems.Select(c => c.BookId).Distinct().ToList();
        var now = DateTime.UtcNow;

        var usedDiscountCounts = await _orderRepository.EntitySet
            .Where(o => o.UserId == userId && 
                        !string.IsNullOrEmpty(o.DiscountCode) &&
                        o.Status != OrderStatus.Cancelled.ToString())
            .GroupBy(o => o.DiscountId)
            .Select(g => new
            {
                Code = g.Key,
                UsageCount = g.Count()
            })
            .ToDictionaryAsync(x => x.Code, x => x.UsageCount);

        var discounts = await _discountRepository.EntitySet
            .LoadWith(d => d.ApplicableDiscountBooks)
            .Where(d =>
                d.IsPublic && 
                d.IsActive && d.IsDeleted == false &&
                d.StartDate <= now &&
                d.EndDate >= now &&
                d.MinimumOrderAmount <= totalAmount &&
                (d.TotalUsageLimit == null || d.CurrentUsageCount < d.TotalUsageLimit))
            .ToListAsync();

        var result = new List<Discount>();

        foreach (var discount in discounts)
        {
            var userUsageCount = usedDiscountCounts.TryGetValue(discount.Id, out var count) ? count : 0;
            if (userUsageCount >= discount.MaxUsagePerUser)
                continue;

            if (discount.ApplicableDiscountBooks.Any())
            {
                var applicableBookIds = discount.ApplicableDiscountBooks.Select(x => x.BookId).ToHashSet();
                if (!bookIds.Any(id => applicableBookIds.Contains(id)))
                    continue;
            }

            result.Add(discount);
        }

        return result;
    }

    public async Task DeleteDiscountAsync(Discount discount)
    {
        if (discount == null)
            throw new ArgumentNullException(nameof(discount), "Discount cannot be null");
        //await _applicableDiscountBookRepository.EntitySet.DeleteAsync(x => x.DiscountId == discount.Id);
        //await _excludedDiscountBookRepository.EntitySet.DeleteAsync(x => x.DiscountId == discount.Id);
        //await _discountRoleRepository.EntitySet.DeleteAsync(x => x.DiscountId == discount.Id);
        await _discountRepository.DeleteAsync(discount);
    }

    public async Task<Discount> GetDiscountByIdAsync(int discountId)
    {
        return await _discountRepository.EntitySet.LoadWith(d => d.ApplicableDiscountBooks)
            //.LoadWith(d => d.ExcludedDiscountBooks)
            //.LoadWith(d => d.DiscountRoles)
            .FirstOrDefaultAsync(d => d.Id == discountId &&  d.IsDeleted == false);
    }

    public async Task<DiscountCalculationResult> CalculateDiscountAsync(string code, List<int> cartItemIds, int userId)
    {
        var discount = await _discountRepository.EntitySet
            .LoadWith(d => d.ApplicableDiscountBooks)
            //.LoadWith(d => d.ExcludedDiscountBooks)
            //.LoadWith(d => d.DiscountRoles)
            .FirstOrDefaultAsync(d => d.Code == code && d.IsActive && d.IsDeleted == false);

        if (discount == null)
            return Invalid("Mã không tồn tại hoặc bị vô hiệu hóa.");

        if (DateTime.UtcNow < discount.StartDate || DateTime.UtcNow > discount.EndDate)
            return Invalid("Mã không còn hiệu lực.");

        var cartItems = await _cartItemRepository.EntitySet
            .LoadWith(c => c.Book)
            .LoadWith(c => c.CartItemAttributes)
            .LoadWith(c => c.BookAttributeValues)
            .Where(c => cartItemIds.Contains(c.Id))
            .ToListAsync();

        if (!cartItems.Any())
            return Invalid("Giỏ hàng rỗng hoặc không hợp lệ.");

        //var roleIds = await _userRoleRepository.EntitySet
        //    .Where(m => m.UserId == userId)
        //    .Select(m => m.RoleId)
        //    .ToListAsync();

        //if (discount.DiscountRoles.Any() && !discount.DiscountRoles.Any(r => roleIds.Contains(r.RoleId)))
        //    return Invalid("Bạn không có quyền sử dụng mã giảm giá này.");

        var totalBefore = await CalculateCartTotalAsync(cartItems);

        var validItems = cartItems
            .Where(item =>
                (discount.ApplicableDiscountBooks == null || !discount.ApplicableDiscountBooks.Any() || discount.ApplicableDiscountBooks.Any(a => a.BookId == item.BookId)))
            .ToList();

        var validTotal = await CalculateCartTotalAsync(validItems);

        if (validTotal < discount.MinimumOrderAmount)
            return Invalid($"Cần tối thiểu {discount.MinimumOrderAmount:C} để áp dụng.", totalBefore, validTotal);

        var usageCount = await _orderRepository.EntitySet
            .CountAsync(u => u.DiscountId == discount.Id && u.UserId == userId && u.Status != OrderStatus.Cancelled.ToString());

        if (usageCount >= discount.MaxUsagePerUser)
            return Invalid("Bạn đã sử dụng mã giảm giá này quá số lần cho phép.", totalBefore, validTotal);

        if (discount.TotalUsageLimit.HasValue && discount.CurrentUsageCount >= discount.TotalUsageLimit.Value)
            return Invalid("Mã giảm giá đã hết lượt sử dụng.", totalBefore, validTotal);

        decimal discountAmount;
        if (discount.IsPercentage)
        {
            var percent = discount.DiscountPercentage ?? 0;
            discountAmount = validTotal * percent / 100;
            if (discount.MaxDiscountAmount.HasValue)
                discountAmount = Math.Min(discountAmount, discount.MaxDiscountAmount.Value);
        }
        else
        {
            discountAmount = discount.DiscountAmount;
        }

        discountAmount = Math.Min(discountAmount, validTotal);
        var excludedItems = cartItems
             .Where(item => !validItems.Any(v => v.Id == item.Id))
             .ToList();

        string message;
        if (!excludedItems.Any())
        {
            message = "Áp dụng thành công.";
        }
        else
        {
            var excludedNames = excludedItems.Select(i => i.Book.Name).Distinct().ToList();
            message = "Một số sản phẩm không được áp dụng: " + string.Join(", ", excludedNames);
        }
        return new DiscountCalculationResult
        {
            IsValid = true,
            Message = message,
            TotalBeforeDiscount = totalBefore,
            DiscountCode = discount.Code,
            DiscountableAmount = validTotal,
            DiscountAmount = discountAmount
        };
    }

    public async Task<decimal> CalculateCartTotalAsync(List<CartItem> cartItems)
    {
        var total = 0m;

        foreach (var item in cartItems)
        {
            var basePrice = await _bookRepository.EntitySet
                .Where(b => b.Id == item.BookId)
            .Select(b => b.SalePrice)
            .FirstAsync();

            var attributeTotal = await _attributeValueRepository.EntitySet
                .Where(av => item.BookAttributeValues.Select(a => a.Id).Contains(av.Id))
                .SumAsync(av => (decimal?)av.PriceAdjustment) ?? 0;

            total += (basePrice + attributeTotal) * item.Quantity;
        }

        return total;
    }

    private DiscountCalculationResult Invalid(string message, decimal totalBefore = 0, decimal discountable = 0)
    {
        return new DiscountCalculationResult
        {
            IsValid = false,
            Message = message,
            TotalBeforeDiscount = totalBefore,
            DiscountableAmount = discountable,
            DiscountAmount = 0
        };
    }

    public async Task<Discount> GetDiscountByCodeAsync(string code)
    {


        return await _discountRepository
            .EntitySet
            .FirstOrDefaultAsync(d => d.Code.ToLower() == code.ToLower() && d.IsDeleted == false );
    }

    public async Task UpdateDiscountAsync(Discount discount)
    {
        if (discount == null)
            throw new ArgumentNullException(nameof(discount), "Discount cannot be null");
        await _discountRepository.UpdateAsync(discount);
    }
}
