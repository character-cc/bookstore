using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class BookAuthor : IEntity
{
    [Column, PrimaryKey, NotNull]
    public int BookId { get; set; }

    [Column, PrimaryKey, NotNull]
    public int AuthorId { get; set; }

}
