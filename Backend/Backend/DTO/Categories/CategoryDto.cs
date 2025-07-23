using Backend.Data.Domain.Categories;

namespace Backend.DTO.Categories;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public int? ParentId { get; set; }

    public bool IsShowOnHomepage { get; set; }

    public int HomepageDisplayOrder { get; set; } = 0;

    public bool IsShowOnNavigationBar { get; set; } = false;

    public int NavigationDisplayOrder { get; set; } = 0;

    public List<CategoryDto> SubCategories { get; set; } = new List<CategoryDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
