using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class AttributeValue : BaseEntity, IEntity
{
    [Column, NotNull]
    public int AttributeId { get; set; }

    [Column, NotNull]
    public string Value { get; set; } = string.Empty;

    [Column, NotNull]
    public string Label { get; set; } = string.Empty;

    [Column]
    public decimal PriceAdjustment { get; set; } = 0;

    [Column]
    public bool IsPreSelected { get; set; }

    [Column]
    public int DisplayOrder { get; set; }

    [Column]
    public bool IsVariant { get; set; }
}

