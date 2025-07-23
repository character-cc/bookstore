using LinqToDB.Mapping;

namespace Backend.Data.Domain.Authors;

[Table]
public class Publisher : BaseEntity, IEntity
{
    [Column, NotNull]
    public string Name { get; set; } = string.Empty;

    [Column]
    public string Description { get; set; } = string.Empty;

    [Column]
    public string Website { get; set; } = string.Empty;

    [Column]
    public string LogoUrl { get; set; } = string.Empty;
}
