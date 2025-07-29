using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Products;
using LinqToDB.Mapping;

namespace Backend.DTO.Products;

public class CreateCustomAttributeRequest
{
    public int Id { get; set; }

    public int BookId { get; set; }

    public string Name { get; set; } = string.Empty;

    public CustomAttributeType Type
    {
        get => (CustomAttributeType)CustomAttributeTypeId;
        set => CustomAttributeTypeId = (int)value;
    }

    public int CustomAttributeTypeId { get; set; }

    public string Tooltip { get; set; }

    public bool IsRequired { get; set; } = false;

    public int DisplayOrder { get; set; } = 0;

    public List<CreateAttributeValueRequest> Values { get; set; } = new List<CreateAttributeValueRequest>();
}
