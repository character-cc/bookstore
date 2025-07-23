using LinqToDB.Mapping;

namespace Backend.Data.Domain.Categories;

[Table]
public class Category : BaseEntity , IEntity
{

    [Column, NotNull]
    public string Name { get; set; } = string.Empty;

    [Column]
    public string Description { get; set; } = string.Empty;

    [Column]
    public string ImageUrl { get; set; } = string.Empty;

    [Column]
    public int? ParentId { get; set; }

    [Column]
    public bool IsShowOnHomepage { get; set; }

    [Column]
    public int HomepageDisplayOrder { get; set; } = 0;

    [Column]
    public bool IsShowOnNavigationBar { get; set; } = false;

    [Column]
    public int NavigationDisplayOrder { get; set; } = 0;

    [Association(ThisKey = nameof(Id), OtherKey = nameof(ParentId))]
    public List<Category> SubCategories { get; set; } = new List<Category>();

}
