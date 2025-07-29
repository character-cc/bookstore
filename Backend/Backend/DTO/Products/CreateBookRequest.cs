namespace Backend.DTO.Products;

public class CreateBookRequest
{
    public string Name { get; set; } = string.Empty;

    public string Isbn { get; set; } = string.Empty;

    public decimal CostPrice { get; set; } = 0;

    public decimal OriginalPrice { get; set; } = 0;

    public decimal SalePrice { get; set; } = 0;

    public int InitialStockQuantity { get; set; } = 0;

    public int Weight { get; set; } = 0;

    public int Length { get; set; } = 0;

    public int Width { get; set; } = 0;

    public int Height { get; set; } = 0;
    public bool Published { get; set; } = true;

    public DateTime PublishedDate { get; set; }

    public string ShortDescription { get; set; } = string.Empty;

    public string FullDescription { get; set; } = string.Empty;

    public string Language { get; set; } = string.Empty;

    public bool IsGift { get; set; } = false;

    public int PageCount { get; set; } = 0;

    public int InventoryManagementMethodId { get; set; }

    public int StockQuantity { get; set; } = 0;

    public int LowStockThreshold { get; set; } = 0;

    public bool MarkAsBestseller { get; set; }

    public bool MarkAsNew { get; set; }

    public bool IsShowAsNewOnHome { get; set; }

    public bool IsShowAsBestsellerOnHome { get; set; }

    public int DisplayOrderBestseller { get; set; } = 0;

    public int DisplayOrderAsNew { get; set; } = 0;

    public int DisplayOrderAsSale { get; set; } = 0;

    public List<int> AuthorIds { get; set; } = new List<int>();

    public List<int> CategoryIds { get; set; } = new List<int>();

    public List<int> PublisherIds { get; set; } = new List<int>();

    public List<string> ImageUrls { get; set; } = new List<String>();

}

