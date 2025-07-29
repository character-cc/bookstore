using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Products.Enum;
using Backend.DTO.Products;
using Backend.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class BookController : PublicController
{

    private readonly IBookService _bookService;

    private readonly IMapper _mapper;

    public BookController(IBookService bookService, IMapper mapper)
    {
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService), "Book service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
    }




    [HttpGet("books/{id}")]
    public async Task<IActionResult> GetBook(int id)
    {
        var book = await _bookService.GetBookAsync(id);
        var bookDto = _mapper.Map<BookDto>(book);
        return Ok(bookDto);
    }

    [HttpPost("books/new/search")]
    public async Task<IActionResult> GetNewBooks([FromBody] SearchBookRequest request)
    {
        if (string.IsNullOrEmpty(request.SortBy))
        {
            request.SortBy = nameof(Book.PublishedDate);
        }
        var orderBy = SortableFields.GetSelector<Book>(request.SortBy);
        var sortDesc = request.SortDesc ?? false;

        var books = await _bookService.GetFilteredBooksAsync(
            markAsNew: true,
            orderBy: orderBy,
            orderDesc: sortDesc,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );
        var items = books.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var bookDtos = new PagedList<BookDto>(items, request.PageIndex, request.PageSize,books.TotalCount);
        return Ok(bookDtos);
    }

    [HttpPost("books/bestsellers/search")]
    public async Task<IActionResult> GetBestsellerBooks([FromBody] SearchBookRequest request)
    {
        if(string.IsNullOrEmpty(request.SortBy))
        {
            request.SortBy = nameof(Book.PublishedDate);
        }
        var orderBy = SortableFields.GetSelector<Book>(request.SortBy);
        var sortDesc = request.SortDesc ?? false;

        var books = await _bookService.GetFilteredBooksAsync(
            markAsBestseller: true,
            orderBy: orderBy,
            orderDesc: sortDesc,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );
        var items = books.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var bookDtos = new PagedList<BookDto>(items, request.PageIndex, request.PageSize, books.TotalCount);
        return Ok(bookDtos);
    }

    [HttpPost("books/sales/search")]
    public async Task<IActionResult> GetSaleBooks([FromBody] SearchBookRequest request)
    {
        if (string.IsNullOrEmpty(request.SortBy))
        {
            request.SortBy = nameof(Book.PublishedDate);
        }
        var orderBy = SortableFields.GetSelector<Book>(request.SortBy);
        var sortDesc = request.SortDesc ?? false;

        var books = await _bookService.GetFilteredBooksAsync(
            onlyDiscounted: true,
            orderBy: orderBy,
            orderDesc: sortDesc,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );
        var items = books.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var bookDtos = new PagedList<BookDto>(items, request.PageIndex, request.PageSize, books.TotalCount);
        return Ok(bookDtos);
    }

    [HttpGet("books/custom-attributes/enum")]
    public IActionResult GetCustomAttributeEnums()
    {
        var result = EnumHelper.ToList<CustomAttributeType>();
        return Ok(result);
    }

    [HttpGet("books/sale/show-home")]
    public async Task<IActionResult> GetBooksOnSaleForHomePage([FromQuery] int pageIndex, [FromQuery] int pageSize)
    {
        if (pageIndex <= 0 && pageSize <= 0)
        {
            pageIndex = 0;
            pageSize = int.MaxValue;
        }

        var books = await _bookService.GetBooksOnSaleForHomePageAsync(pageIndex, pageSize);

        var bookDtos = books.Select(b => _mapper.Map<BookDto>(b)).ToList();
        return Ok(bookDtos);
    }

    [HttpGet("books/new/show-home")]
    public async Task<IActionResult> GetNewBooksForHomePage([FromQuery] int pageIndex, [FromQuery] int pageSize)
    {
        if (pageIndex <= 0 && pageSize <= 0)
        {
            pageIndex = 0;
            pageSize = int.MaxValue;
        }

        var books = await _bookService.GetNewBooksForHomePageAsync(pageIndex, pageSize);
        var bookDtos = books.Select(b => _mapper.Map<BookDto>(b)).ToList();
        return Ok(bookDtos);
    }

    [HttpGet("books/bestsellers/show-home")]
    public async Task<IActionResult> GetBestsellersForHomePage([FromQuery] int pageIndex, [FromQuery] int pageSize)
    {
        if (pageIndex <= 0 && pageSize <= 0)
        {
            pageIndex = 0;
            pageSize = int.MaxValue;
        }

        var books = await _bookService.GetBestsellersForHomePageAsync(pageIndex, pageSize);
        var bookDtos = books.Select(b => _mapper.Map<BookDto>(b)).ToList();
       
        return Ok(bookDtos);
    }

    [HttpGet("books/{id}/detail")]
    public async Task<IActionResult> GetBookDetail(int id)
    {
        var book = await _bookService.GetBookDetailAsync(id);
        if (book == null)
        {
            return NotFound();
        }

        var bookDto = _mapper.Map<BookDto>(book);
        return Ok(bookDto);
    }

    [HttpGet("books/count")]
    public async Task<IActionResult> GetBooksCount()
    {
        var count = await _bookService.GetAllBooksAsync(getOnlyTotalCount: true);
        return Ok(new { totalCount = count.TotalCount });
    }

    [HttpGet("books")]
    public async Task<IActionResult> GetAllBooks(
        [FromQuery] int pageIndex = 0,
        [FromQuery] int pageSize = int.MaxValue)
    {
        var books = await _bookService.GetAllBooksAsync(pageIndex: pageIndex, pageSize: pageSize);
        var bookDtos = books.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        return Ok(bookDtos);
    }


    [HttpPost("books/search")]
    public async Task<IActionResult> SearchBooks([FromBody] SearchRequest request)
    {
      
        var books = await _bookService.SearchBooksAsync(request);
        var bookDtos = books.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var pagedList = new PagedList<BookDto>(bookDtos, request.PageIndex, request.PageSize ,books.TotalCount);
        return Ok(pagedList);
    }
}
