namespace Backend.DTO.Products;

public class BookProfitReportRequest
{
    public string Keyword { get; set; }


    public string SortBy { get; set; }


    public bool SortDesc { get; set; } = false;

    public DateTime? From { get; set; }

    public DateTime? To { get; set; }

    public int PageIndex { get; set; } = 0;

    public int PageSize { get; set; } = 20;
}
