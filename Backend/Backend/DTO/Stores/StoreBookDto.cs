using Backend.Data.Domain.Products;
using Backend.Data.Domain.Stores;
using Backend.DTO.Products;

namespace Backend.DTO.Stores;

public class StoreBookDto
{
    public int StoreId { get; set; }

    public int BookId { get; set; }

    public int Quantity { get; set; } = 0;

    public int LowStockThreshold { get; set; } = 0;

    public StoreDto Store { get; set; }

    public BookDto Book { get; set; }
}
