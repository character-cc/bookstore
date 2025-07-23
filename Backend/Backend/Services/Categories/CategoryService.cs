using Backend.Common;
using System.Linq.Expressions;
using Backend.Data;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Products;
using LinqToDB;

namespace Backend.Services.Categories;

public class CategoryService : ICategoryService
{

    private readonly IRepository<Category> _categoryRepository;

    private readonly IRepository<BookCategory> _bookCategoryRepository;

    public CategoryService(IRepository<Category> categoryRepository, IRepository<BookCategory> bookCategoryRepository)
    {
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository), "Category repository is not initialized.");
        _bookCategoryRepository = bookCategoryRepository ?? throw new ArgumentNullException(nameof(bookCategoryRepository), "Book category repository is not initialized.");
    }

    public async Task<List<Category>> GetAllCategoriesWithChildrenAsync(int? maxDepth = null)
    {
        var categories = await _categoryRepository.Table
            .OrderBy(c => c.Name)
            .ToListAsync();

        var categoryDict = categories.ToDictionary(c => c.Id);
        var result = new List<Category>();

        foreach (var category in categories)
        {
            if (!category.ParentId.HasValue || !categoryDict.ContainsKey(category.ParentId.Value))
            {
                result.Add(category);
            }
            else
            {
                var parent = categoryDict[category.ParentId.Value];
                if (parent.SubCategories == null)
                    parent.SubCategories = new List<Category>();
                parent.SubCategories.Add(category);
            }
        }

        if (maxDepth.HasValue)
        {
            foreach (var category in result)
            {
                TrimSubCategories(category, maxDepth.Value, 0);
            }
        }

        return result;
    }

    private void TrimSubCategories(Category category, int maxDepth, int currentDepth)
    {
        if (category.SubCategories == null || currentDepth >= maxDepth)
        {
            category.SubCategories = null;
            return;
        }

        foreach (var subCategory in category.SubCategories)
        {
            TrimSubCategories(subCategory, maxDepth, currentDepth + 1);
        }
    }

    public async Task<List<Category>> GetCategoryShowHomeAsync(int pageIndex = 0, int pageSize = int.MaxValue)
    {
        if (pageIndex < 0 || pageSize <= 0)
            throw new ArgumentException("Page index and size must be positive integers.");
        var categories = await _categoryRepository.Table
            .Where(c => c.IsShowOnHomepage)
            .OrderBy(c => c.HomepageDisplayOrder)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return categories;
    }

    public async Task<int> CountBookOfCategoryAsync(int categoryId)
    {
        if (categoryId <= 0)
            throw new ArgumentException("Category ID must be a positive integer.", nameof(categoryId));
        return await _bookCategoryRepository.Table
            .CountAsync(bc => bc.CategoryId == categoryId);
    }

    public async Task<List<Category>>  GetCategoryShowOnNavBarAsync(){
        return await _categoryRepository.EntitySet.LoadWith(c => c.SubCategories).Where(c => c.IsShowOnNavigationBar)
            .OrderBy(c => c.NavigationDisplayOrder)
            .ToListAsync();
    }

    public async Task<Category> GetCategoryByIdAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Category ID must be a positive integer.", nameof(id));
        return await _categoryRepository.EntitySet.Where(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Category>> GetAllCategoriesAsync()
    {
        return await _categoryRepository.Table
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<IPagedList<Category>> GetAllAsync(string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        var query = _categoryRepository.EntitySet;

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(c => c.Name.Contains(keyword));


        query = query.OrderByDescending(c => c.UpdatedAt);

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }


    public async Task CreateAsync(Category category)
    {
        await _categoryRepository.InsertAsync(category);
    }
    public async Task<List<Category>> GetAvailableParentsAsync(int currentCategoryId)
    {
        var allCategories = await _categoryRepository.EntitySet.ToListAsync();
        if (currentCategoryId == 0)
            return allCategories;

        var subCategoryIds = await GetAllSubCategoryIdsAsync(currentCategoryId);
        subCategoryIds.Add(currentCategoryId);

        var availableParents = allCategories
            .Where(c => !subCategoryIds.Contains(c.Id))
            .OrderBy(c => c.Name) 
            .ToList();

        return availableParents;
    }

    public async Task UpdateAsync(int id, Category category)
    {

        await _categoryRepository.UpdateAsync(category);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _categoryRepository.EntitySet
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Category with ID {id} not found");

        var subCategoryIds = await GetAllSubCategoryIdsAsync(id);

        foreach (var subCategoryId in subCategoryIds)
        {
            var subCategory = await _categoryRepository.EntitySet
                .FirstOrDefaultAsync(c => c.Id == subCategoryId);
            if (subCategory != null)
            {
                await _categoryRepository.DeleteAsync(subCategory);
            }
        }

        await _categoryRepository.DeleteAsync(category);
    }

    private async Task<List<int>> GetAllSubCategoryIdsAsync(int parentId)
    {
        var result = new List<int>();
        var subCategories = await _categoryRepository.EntitySet
            .Where(c => c.ParentId == parentId)
            .Select(c => c.Id)
            .ToListAsync();

        foreach (var subCategoryId in subCategories)
        {
            result.Add(subCategoryId);
            var childSubCategoryIds = await GetAllSubCategoryIdsAsync(subCategoryId);
            result.AddRange(childSubCategoryIds);
        }

        return result;
    }
}
