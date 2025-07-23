using Backend.Common;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Backend.DTO.Authors;
using Backend.Services.Authors;
using Backend.Data.Domain.Authors;
using System.Linq.Expressions;
namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class PublisherController : AdminController
{
    private readonly IPublisherService _publisherService;
    private readonly IMapper _mapper;

    public PublisherController(IPublisherService publisherService, IMapper mapper)
    {
        _publisherService = publisherService;
        _mapper = mapper;
    }

    [HttpPost("publishers/search")]
    public async Task<IActionResult> SearchPublishers([FromBody] GetPublishersRequest request)
    {

        var pagedPublishers = await _publisherService.GetAllAsync(
            keyword: request.Keyword,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );

        var items = pagedPublishers.Items.Select(p => _mapper.Map<PublisherDto>(p)).ToList();
        var result = new PagedList<PublisherDto>(items, pagedPublishers.PageIndex, pagedPublishers.PageSize, pagedPublishers.TotalCount);
        return Ok(result);
    }



    [HttpGet("publishers/{id}")]
    public async Task<ActionResult<PublisherRequestDto>> GetById(int id)
    {

            var publisher = await _publisherService.GetByIdAsync(id);
            var publisherDto = _mapper.Map<PublisherDto>(publisher);
            return Ok(publisherDto);
        

    }

    [HttpPost("publishers")]
    public async Task<ActionResult<PublisherRequestDto>> Create([FromBody] PublisherRequestDto request)
    {

            var publisher = _mapper.Map<Publisher>(request);
            await _publisherService.CreateAsync(publisher);
            return Ok(new {message = " Thành công"});

    }

    [HttpPut("publishers/{id}")]
    public async Task<ActionResult<PublisherRequestDto>> Update(int id, [FromBody] PublisherRequestDto request)
    {

            var existingPublisher = await _publisherService.GetByIdAsync(id);
            existingPublisher = _mapper.Map(request, existingPublisher);
             await _publisherService.UpdateAsync(id, existingPublisher);
            return Ok(new { message = " Thành công" });
        
    }

    [HttpDelete("publishers/{id}")]
    public async Task<ActionResult> Delete(int id)
    {

            await _publisherService.DeleteAsync(id);
        return Ok(new { message = " Thành công" });

    }
}
