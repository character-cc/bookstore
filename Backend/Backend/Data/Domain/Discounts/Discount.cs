using LinqToDB.Mapping;

namespace Backend.Data.Domain.Discounts;
[Table]
public class Discount : BaseEntity, IEntity, ISoftDelete
{
    [Column]
    public string Code { get; set; } = string.Empty;

    [Column, NotNull]
    public string Description { get; set; } = string.Empty;

    [Column]
    public int? DiscountPercentage { get; set; }

    [Column, Nullable]
    public decimal? MaxDiscountAmount { get; set; }

    [Column]
    public decimal DiscountAmount { get; set; } = 0;

    [Column]
    public bool IsPercentage { get; set; } = false;

    [Column]
    public bool IsPublic { get; set; } = true;

    [Column]
    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    [Column]
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(30);

    [Column]
    public bool IsActive { get; set; } = true;

    [Column]
    public decimal MinimumOrderAmount { get; set; } = 0;
    [Column] 
    public int MaxUsagePerUser { get; set; } = 1;

    [Column, Nullable]
    public int? TotalUsageLimit { get; set; }
    [Column] 
    public int CurrentUsageCount { get; set; } = 0;

    [Association(ThisKey = nameof(Id) , OtherKey = nameof(ApplicableDiscountBook.DiscountId))]
    public List<ApplicableDiscountBook> ApplicableDiscountBooks { get; set; } 

    [Association(ThisKey = nameof(Id), OtherKey = nameof(DiscountRole.DiscountId))]

    public List<DiscountRole> DiscountRoles { get; set; } 

    [Association(ThisKey = nameof(Id), OtherKey = nameof(ExcludedDiscountBook.DiscountId))]

    public List<ExcludedDiscountBook> ExcludedDiscountBooks { get; set; }

    [Column]
    public bool IsDeleted { get; set; } = false;
}
