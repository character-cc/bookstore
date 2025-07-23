using Backend.Data.Domain.Discounts;
using LinqToDB.Mapping;

namespace Backend.DTO.Discounts;

public class DiscountDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int? DiscountPercentage { get; set; }

    public bool IsPublic { get; set; } 
    public decimal? MaxDiscountAmount { get; set; }

    public decimal DiscountAmount { get; set; } = 0;

    public bool IsPercentage { get; set; } = false;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(30);

    public bool IsActive { get; set; } = true;

    public decimal MinimumOrderAmount { get; set; } = 0;
    public int MaxUsagePerUser { get; set; } = 1;

    public int? TotalUsageLimit { get; set; }
    public int CurrentUsageCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<int> ApplicableDiscountBookIds { get; set; } = new List<int>();

    public List<int> DiscountRoleIds { get; set; } = new List<int>();


    public List<int> ExcludedDiscountBookIds { get; set; } = new List<int>();
}
