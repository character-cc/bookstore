namespace Backend.DTO.Products;

public class CreateImportBookRequest
{
    public int BookId { get; set; }
    public int InitialStockQuantity { get; set; }
    public decimal CostPrice { get; set; }
}
