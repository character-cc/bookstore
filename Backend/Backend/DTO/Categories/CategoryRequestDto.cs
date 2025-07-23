namespace Backend.DTO.Categories;

public class CategoryRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public bool IsShowOnHomepage { get; set; }
    public int HomepageDisplayOrder { get; set; } = 0;
    public bool IsShowOnNavigationBar { get; set; } = false;
    public int NavigationDisplayOrder { get; set; } = 0;
}
