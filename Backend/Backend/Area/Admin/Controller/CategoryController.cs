using System.Linq.Expressions;
using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Categories;
using Backend.DTO.Categories;
using Backend.Services.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class CategoryController : AdminController
{

    private readonly ICategoryService _categoryService;
    private readonly IMapper _mapper;

    public CategoryController(ICategoryService categoryService, IMapper mapper)
    {
        _categoryService = categoryService;
        _mapper = mapper;
    }

    [HttpPost("categories/search")]
    public async Task<IActionResult> SearchCategories([FromBody] GetCategoriesRequest request)
    {

        var pagedCategories = await _categoryService.GetAllAsync(
            keyword: request.Keyword,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );

        var items = pagedCategories.Items.Select(c => _mapper.Map<CategoryDto>(c)).ToList();
        var result = new PagedList<CategoryDto>(items, pagedCategories.PageIndex, pagedCategories.PageSize, pagedCategories.TotalCount);
        return Ok(result);
    }


    [HttpGet("categories/{id}")]
    public async Task<ActionResult> GetById(int id)
    {

            var category = await _categoryService.GetCategoryByIdAsync(id);
            var categoryDto = _mapper.Map<CategoryDto>(category);
            return Ok(categoryDto);
        
      
    }

    [HttpPost("categories")]
    public async Task<ActionResult> Create([FromBody] CategoryRequestDto request)
    {
        var category = _mapper.Map<Category>(request);
        await _categoryService.CreateAsync(category);
        return Ok(new {message = " Thành công"});
    }

    [HttpPut("categories/{id}")]
    public async Task<ActionResult<CategoryRequestDto>> Update(int id, [FromBody] CategoryRequestDto request)
    {

            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }
            category = _mapper.Map(request, category);
            await _categoryService.UpdateAsync(id, category);
            return Ok(new { message = " Thành công" });
        

    }

    [HttpDelete("categories/{id}")]
    public async Task<ActionResult> Delete(int id)
    {

            await _categoryService.DeleteAsync(id);
            return Ok(new { message = " Thành công" });
        
       
    }

    [HttpGet("categories/available-parents/{currentCategoryId}")]
    public async Task<ActionResult<List<CategoryRequestDto>>> GetAvailableParents(int currentCategoryId)
    {
        var categories = await _categoryService.GetAvailableParentsAsync(currentCategoryId);
        var categoryDtos = _mapper.Map<List<CategoryDto>>(categories);
        return Ok(categoryDtos);
    }


}
