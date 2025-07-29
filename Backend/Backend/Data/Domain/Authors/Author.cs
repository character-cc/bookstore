using LinqToDB.Mapping;

namespace Backend.Data.Domain.Authors;

[Table]
public class Author : BaseEntity, IEntity
{
    [Column, NotNull]
    public string Name { get; set; } = string.Empty;

    [Column]
    public string Biography { get; set; } = string.Empty;

    [Column]
    public string ImageUrl { get; set; } = string.Empty;

    [Column]
    public bool IsShownOnHomePage { get; set; } = false;

    [Column]
    public int DisplayOrder { get; set; } = 0;
}
