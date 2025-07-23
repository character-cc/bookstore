namespace Backend.DTO.Stores;

public class GetBooksOfInventoryStoreRequest
{
    public int StoreId { get; set; } = 0;
    public string Keyword { get; set; } = string.Empty;

    public string StockFilter { get; set; } 
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 100;
}
