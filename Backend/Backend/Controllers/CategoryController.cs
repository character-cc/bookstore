using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Products;
using Backend.DTO.Categories;
using Backend.DTO.Products;
using Backend.Services.Categories;
using Backend.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class CategoryController : PublicController
{
    private readonly ICategoryService _categoryService;

    private readonly IMapper _mapper;

    private readonly IBookService _bookService;



    public CategoryController(ICategoryService categoryService, IMapper mapper, IBookService bookService)
    {
        _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService), "Category service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService), "Book service is not initialized.");
    }

    #region categories

    [HttpPost("categories/all")]
    public async Task<IActionResult> GetAllCategories([FromBody] int? maxDepth = null)
    {
        if (maxDepth.HasValue && maxDepth < 0)
            return BadRequest("Max depth cannot be negative.");
        var categories = await _categoryService.GetAllCategoriesWithChildrenAsync(maxDepth);
        var categoryDtos = categories.Select(c => _mapper.Map<CategoryDto>(c)).ToList();
        return Ok(categories);
    }

    [HttpGet("categories/show-home")]
    public async Task<IActionResult> GetCategoriesForHomePage([FromQuery] int pageIndex, int pageSize)
    {

        if (pageIndex <= 0 && pageSize <= 0)
        {
            pageIndex = 0;
            pageSize = int.MaxValue;
        }
        var categories = await _categoryService.GetCategoryShowHomeAsync(pageIndex,pageSize);
        var categoryDtos = new List<CategoryHomeDto>();
        foreach (var category in categories)
        {
            var dto = _mapper.Map<CategoryHomeDto>(category);
            dto.BookCount = await _categoryService.CountBookOfCategoryAsync(category.Id);
            categoryDtos.Add(dto);
        }
        return Ok(categoryDtos);
    }

    [HttpGet("categories/{id}")]
    public async Task<IActionResult> GetCategories([FromRoute] int id, [FromQuery] int pageIndex, int pageSize)
    {

        if (pageIndex <= 0 && pageSize <= 0)
        {
            pageIndex = 0;
            pageSize = int.MaxValue;
        }
        var category = await _categoryService.GetCategoryByIdAsync(id);
        var dto = _mapper.Map<CategoryHomeDto>(category);
        dto.BookCount = await _categoryService.CountBookOfCategoryAsync(category.Id);
        //foreach (var category in categories)
        //{

        //    categoryDtos.Add(dto);
        //}
        return Ok(dto);
    }

    [HttpPost("categories/{id::int}/books")]
    public async Task<IActionResult> GetBooksByCategoryId([FromRoute] int id, [FromQuery] int pageIndex, [FromQuery] int pageSize , [FromBody] SearchBookRequest request)
    {
        if (string.IsNullOrEmpty(request.SortBy))
        {
            request.SortBy = nameof(Book.PublishedDate);
        }
        var orderBy = SortableFields.GetSelector<Book>(request.SortBy);
        var sortDesc = request.SortDesc ?? false;
        var books = await _bookService.GetBooksByCategoryIdAsync(categoryId: id, pageIndex: request.PageIndex ,
            pageSize: request.PageSize, orderBy: orderBy, orderDesc:sortDesc );
        var itemDtos = books.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var bookDtos = new PagedList<BookDto>(itemDtos,request.PageIndex , request.PageSize, books.TotalCount);
        return Ok(bookDtos);
    }

    [HttpGet("categories/navbar")]
    public async Task<IActionResult> GetCategoriesForNavBar()
    {
        var categories = await _categoryService.GetCategoryShowOnNavBarAsync();
        var categoryDtos = categories.Select(c => _mapper.Map<CategoryDto>(c)).ToList();
        return Ok(categoryDtos);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        var categoryDtos = categories.Select(c => _mapper.Map<CategoryDto>(c)).ToList();
        return Ok(categoryDtos);
    }

    #endregion
}
