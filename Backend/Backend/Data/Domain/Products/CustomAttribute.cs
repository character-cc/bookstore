using Backend.Data.Domain.Products.Enum;
using LinqToDB;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class CustomAttribute : BaseEntity, IEntity
{
    [Column, NotNull]
    public int BookId { get; set; }

    [Column, NotNull]
    public string Name { get; set; } = string.Empty;

    [NotColumn]
    public CustomAttributeType Type
    {
        get => (CustomAttributeType)CustomAttributeTypeId;
        set => CustomAttributeTypeId = (int)value;
    }

    [Column, NotNull]
    public int CustomAttributeTypeId { get; set; }

    [Column, Nullable]
    public string Tooltip { get; set; }

    [Column, NotNull]
    public bool IsRequired { get; set; }

    [Column, NotNull]
    public int DisplayOrder { get; set; }


    [Association(ThisKey = nameof(Id), OtherKey = nameof(AttributeValue.AttributeId))]
    public List<AttributeValue> Values { get; set; } = new List<AttributeValue>();
}
    