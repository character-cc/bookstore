namespace Backend.DTO.Products;

public class CreateAttributeValueRequest
{
    public int AttributeId { get; set; }
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; } = 0;
    public bool IsPreSelected { get; set; }
    public int DisplayOrder { get; set; }
}
