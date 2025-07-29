
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class BookImage : BaseEntity, IEntity
{
    [Column, NotNull]
    public int BookId { get; set; }

    [Column, NotNull]
    public string ImageUrl { get; set; } = null!;

  
}
