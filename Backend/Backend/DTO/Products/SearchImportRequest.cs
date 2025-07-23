namespace Backend.DTO.Products;

public class SearchImportRequest
{
    public string Keyword { get; set; } 
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 100;

}
