namespace Backend.DTO.Discounts;

public class GetDiscountsRequest
{
    public string Code { get; set; }
    public DateTime? StartDate { get; set; } 
    public DateTime? EndDate { get; set; }   

    public string SortBy { get; set; }
    public bool? SortDesc { get; set; }

    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 20;
}
