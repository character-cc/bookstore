namespace Backend.DTO.Products;

public class SearchRequest
{
    public string Keyword { get; set; }

    public List<int> CategoryIds { get; set; } = new List<int>();

    public List<int> AuthorIds { get; set; } = new List<int>();

    public decimal? MinPrice { get; set; }

    public decimal? MaxPrice { get; set; }


    public bool? IsSale { get; set; }
    public string SortBy { get; set; }
    public bool? SortDesc { get; set; }
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 10;
}
