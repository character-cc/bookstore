namespace Backend.DTO.Products;

public class BookProfitReportDto
{
    public BookDto Book { get; set; } = default!;
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal Profit => TotalRevenue - TotalCost;
    public int CurrentStock { get; set; }
    public int TotalImportedQuantity { get; set; }

}
