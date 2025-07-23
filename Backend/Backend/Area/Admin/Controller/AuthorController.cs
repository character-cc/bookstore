
using System.Linq.Expressions;
using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Authors;
using Backend.DTO.Authors;
using Backend.Services.Authors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class AuthorController : AdminController
{

    private readonly IAuthorService _authorService;
    private readonly IMapper _mapper;

    public AuthorController(IAuthorService authorService, IMapper mapper)
    {
        _authorService = authorService;
        _mapper = mapper;
    }

    [HttpGet("authors/{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        try
        {
            var author = await _authorService.GetByIdAsync(id);
            var authorDto = _mapper.Map<AuthorDTO>(author);
            return Ok(authorDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("authors")]
    public async Task<ActionResult> Create([FromBody] AuthorRequestDto request)
    {
        var author = _mapper.Map<Author>(request);
         await _authorService.CreateAsync(author);
        return Ok(new {message = " Thành công"});
    }

    [HttpPut("authors/{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] AuthorRequestDto request)
    {

            var existingAuthor = await _authorService.GetByIdAsync(id);
            existingAuthor = _mapper.Map(request, existingAuthor);
            await _authorService.UpdateAsync(id, existingAuthor);
            return Ok(new { message = " Thành công" });

        
    }

    [HttpDelete("authors/{id}")]
    public async Task<ActionResult> Delete(int id)
    {

            await _authorService.DeleteAsync(id);
        return Ok(new { message = " Thành công" });

    }

    [HttpPost("authors/search")]
    public async Task<IActionResult> SearchAuthors([FromBody] GetAuthorsRequest request)
    {
      
        var pagedAuthors = await _authorService.GetAllAsync(
            keyword: request.Keyword,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );

        var items = pagedAuthors.Items.Select(a => _mapper.Map<AuthorDTO>(a)).ToList();
        var result = new PagedList<AuthorDTO>(items, pagedAuthors.PageIndex, pagedAuthors.PageSize, pagedAuthors.TotalCount);
        return Ok(result);
    }
}
