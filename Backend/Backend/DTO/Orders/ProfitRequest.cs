namespace Backend.DTO.Orders;

public class ProfitRequest
{
    public string SearchTerm { get; set; } = string.Empty;
    public DateTime StartDate { get; set; } 
    public DateTime EndDate { get; set; } 
  
    public int PageIndex { get; set; } = 0;

    public int PageSize { get; set; } = 10;
}
