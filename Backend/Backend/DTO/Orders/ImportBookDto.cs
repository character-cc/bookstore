
using Backend.DTO.Products;

namespace Backend.DTO.Orders;

public class ImportBookDto
{
    public int Id { get; set; }
    public int BookId { get; set; }

    public int InitialStockQuantity { get; set; } = 0;

    public decimal CostPrice { get; set; } = 0;

    public int StockQuantity { get; set; } = 0;

    public BookDto Book { get; set; } = new BookDto();

    public DateTime CreatedAt { get; set; } 
}
