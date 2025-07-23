using AutoMapper;
using Backend.Common;
using Backend.DTO.Authors;
using Backend.Services.Authors;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class AuthorController : PublicController
{
    private readonly IAuthorService _authorService;  
    
    private readonly IPublisherService _publisherService;


    private readonly IMapper _mapper;

    public AuthorController(IAuthorService authorService, IPublisherService publisherService, IMapper mapper)
    {
        _authorService = authorService;
        _publisherService = publisherService;
        _mapper = mapper;
    }

    [HttpGet("authors")]
    public async Task<IActionResult> GetAllAuthorsAsync()
    {
        var authors = await _authorService.GetAllAuthorsAsync();
        var authorDtos = authors.Select(a => _mapper.Map<AuthorDTO>(a)).ToList();
        return Ok(authors);
    }

    [HttpGet("authors/show-home")]
    public async Task<IActionResult> GetAuthorsForHomePageAsync([FromQuery] int pageIndex, [FromQuery] int pageSize)
    {
        if(pageIndex <= 0 && pageSize<= 0)
        {
            pageIndex = 0;
            pageSize = int.MaxValue;
        } 
        var authors = await _authorService.GetAuthorsForHomePageAsync(pageIndex, pageSize);
        var authorDtos = authors.Select(a => _mapper.Map<AuthorDTO>(a)).ToList();
        var authorHomeDtos = new List<AuthorHomeDto>();
        foreach (var author in authorDtos)
        {
            var dto = _mapper.Map<AuthorHomeDto>(author);
            dto.BookCount = await _authorService.GetBookCountOfAuthorAsync(author.Id);
            authorHomeDtos.Add(dto);
        }
        return Ok(authorHomeDtos);
    }

    #region publishers
    [HttpGet("publishers")]
    public async Task<IActionResult> GetAllPublishersAsync()
    {
        var publishers = await _publisherService.GetAllPublishersAsync();
        var publisherDtos = publishers.Select(p => _mapper.Map<PublisherDto>(p)).ToList();
        return Ok(publisherDtos);
    }

    #endregion
}
