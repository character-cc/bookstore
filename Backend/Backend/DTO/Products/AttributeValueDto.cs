using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Products;
using LinqToDB.Mapping;

namespace Backend.DTO.Products;

public class AttributeValueDto
{
    public int Id { get; set; }
    public int AttributeId { get; set; }

    public string Value { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public decimal PriceAdjustment { get; set; } = 0;

    public bool IsPreSelected { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsVariant { get; set; }

    public DateTime CreateAt { get; set; }

    public DateTime UpdateAt { get; set; }
}
