namespace Backend.DTO.Discounts;

public class DiscountCreateOrUpdateDto
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPercentage { get; set; }
    public int? DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }

    public bool IsPublic { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public decimal MinimumOrderAmount { get; set; }
    public int MaxUsagePerUser { get; set; }
    public int? TotalUsageLimit { get; set; }

    public List<int> RoleIds { get; set; } = new();
    public List<int> ApplicableBookIds { get; set; } = new();
    public List<int> ExcludedBookIds { get; set; } = new();
}
