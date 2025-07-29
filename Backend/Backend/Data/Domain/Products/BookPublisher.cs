using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class BookPublisher : IEntity
{
    [Column, PrimaryKey, NotNull]
    public int BookId { get; set; }

    [Column, PrimaryKey, NotNull]
    public int PublisherId { get; set; }

}
