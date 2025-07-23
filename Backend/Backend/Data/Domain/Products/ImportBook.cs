
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class ImportBook : BaseEntity, IEntity
{

    [Column]
    public int BookId { get; set; }

    [Column]
    public int InitialStockQuantity { get; set; } = 0;

    [Column]
    public decimal CostPrice { get; set; } = 0;

    [Column]
    public int StockQuantity { get; set; } = 0;

    [Association(ThisKey = nameof(BookId), OtherKey = nameof(Book.Id), CanBeNull = false)]
    public Book Book { get; set; } 

}
