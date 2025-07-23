using Backend.Data.Domain.Products;
using Backend.Data.Domain.Products.Enum;

namespace Backend.DTO.Products;

public class CustomAttributeDto
{
    public int Id { get; set; }
    public int BookId { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool IsRequired { get; set; }

    public int DisplayOrder { get; set; }
    public int CustomAttributeTypeId { get; set; }


    public CustomAttributeType Type
    {
        get => (CustomAttributeType)CustomAttributeTypeId;
        set => CustomAttributeTypeId = (int)value;
    }

    public string ControlType { get => Type.ToString().ToLowerInvariant(); } 

    public string Tooltip { get; set; }

    public DateTime CreateAt { get; set; }

    public DateTime UpdateAt { get; set; }
    public List<AttributeValueDto> Values { get; set; } = new List<AttributeValueDto>();
}
