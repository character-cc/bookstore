using Backend.Common;
using System.Linq.Expressions;
using Backend.Data.Domain.Categories;

namespace Backend.Services.Categories;

public interface ICategoryService
{
    Task<List<Category>> GetAllCategoriesWithChildrenAsync(int? maxDepth = null);

    Task<List<Category>> GetCategoryShowHomeAsync(int pageIndex = 0, int pageSize = int.MaxValue);

    Task<int> CountBookOfCategoryAsync(int categoryId);

    Task<List<Category>> GetCategoryShowOnNavBarAsync();

    Task<Category> GetCategoryByIdAsync(int id);

    Task<List<Category>> GetAllCategoriesAsync();

    Task<List<Category>> GetAvailableParentsAsync(int currentCategoryId);

    Task<IPagedList<Category>> GetAllAsync(string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue);
    Task CreateAsync(Category category);
    Task UpdateAsync(int id, Category category);
    Task DeleteAsync(int id);
}
