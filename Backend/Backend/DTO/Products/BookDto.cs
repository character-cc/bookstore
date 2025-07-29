using Backend.Data;
using Backend.Data.Domain.Products.Enum;
using Backend.DTO.Authors;
using Backend.DTO.Categories;
using LinqToDB.Mapping;

namespace Backend.DTO.Products;

public class BookDto
{

    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;


    public string Isbn { get; set; } = string.Empty;


    public decimal OriginalPrice { get; set; }

    public decimal CostPrice { get; set; } 
    public decimal SalePrice { get; set; }

    public bool Published { get; set; }

    public DateTime PublishedDate { get; set; }

    public int Weight { get; set; } = 0;

    public int Length { get; set; } = 0;

    public int Width { get; set; } = 0;

    public int Height { get; set; } = 0;

    public string ShortDescription { get; set; } = string.Empty;

    public string FullDescription { get; set; } = string.Empty;



    public string Language { get; set; }


    public bool IsDeleted { get; set; }

    public int PageCount { get; set; }


    public int InventoryManagementMethodId { get; set; }



    public int? LowStockThreshold { get; set; }

    public bool MarkAsBestseller { get; set; }


    public bool MarkAsNew { get; set; }


    public bool IsShowAsNewOnHome { get; set; }


    public bool IsShowAsBestsellerOnHome { get; set; }


    public int DisplayOrderBestseller { get; set; } = 0;


    public int DisplayOrderAsNew { get; set; } = 0;

    public int DisplayOrderAsSale { get; set; } = 0;

    public bool IsGift { get; set; }

    public DateTime CreatedAt { get; set; }


    public DateTime UpdatedAt { get; set; }

    public List<BookImageDto> Images { get; set; } = new List<BookImageDto>();

    public List<AuthorDTO> Authors { get; set; } = new List<AuthorDTO>();

    public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();


    public List<PublisherDto> Publishers { get; set; } = new List<PublisherDto>();

    public List<CustomAttributeDto> CustomAttributes { get; set; } = new List<CustomAttributeDto>();
    public InventoryManagementMethodType InventoryManagementMethodType
    {
        get => (InventoryManagementMethodType)InventoryManagementMethodId;
        set => InventoryManagementMethodId = (int)value;
    }
}
