namespace Backend.DTO.Orders;

public class GetOrderRequest
{
    public string Keyword { get; set; } = string.Empty;

    public int PageIndex { get; set; } = 0;

    public int PageSize { get; set; } = 10;

    public string Status { get; set; }

    public DateTime? FromDate { get; set; } = null;

    public DateTime? ToDate { get; set; } = null;
}
