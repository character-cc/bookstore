using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class BookCategory : IEntity
{
    [Column, PrimaryKey, NotNull]
    public int BookId { get; set; }

    [Column, PrimaryKey, NotNull]
    public int CategoryId { get; set; }
   
}
