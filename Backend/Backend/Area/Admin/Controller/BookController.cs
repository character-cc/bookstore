using System.Linq.Expressions;
using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Products;
using Backend.DTO.Orders;
using Backend.DTO.Products;
using Backend.DTO.Roles;
using Backend.Services.Products;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class BookController : AdminController
{
    private readonly IBookService _bookService;

    private readonly IMapper _mapper;

    public BookController(IBookService bookService, IMapper mapper)
    {
        _bookService = bookService;
        _mapper = mapper;
    }

    #region books

    [HttpPost("books/search")]
    public async Task<IActionResult> GetBooks([FromBody] SearchBookRequest request)
    {

        var orderBy = (Expression<Func<Book, object>>)(b => b.UpdatedAt);
        var sortDesc = true;
        var pagedBooks = await _bookService.GetAllBooksAsync(
            name: request.Name,
            isbn: request.Isbn,
            orderBy: orderBy,
            orderDesc: sortDesc,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );

        var items = pagedBooks.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var result = new PagedList<BookDto>(items, pagedBooks.PageIndex, pagedBooks.PageSize, pagedBooks.TotalCount);

        return Ok(result);
    }

    [HttpPost("books")]
    public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request)
    {

        var bookId = await _bookService.CreateBookAsync(request);
        var book = await _bookService.GetBookAsync(bookId);
        var bookDto = _mapper.Map<BookDto>(book);
        return Ok(bookDto);
    }

    [HttpPut("books/{id}")]
    public async Task<IActionResult> UpdateBook([FromRoute] int id, [FromBody] CreateBookRequest request)
    {
        if (await _bookService.GetBookAsync(id) == null)
        {
            return NotFound(new { meseage = $"Book with ID {id} not found."});
        }

        await _bookService.UpdateBookAsync(id, request);
        var book = await _bookService.GetBookAsync(id);
        var bookDto = _mapper.Map<BookDto>(book);
        return Ok(bookDto);
    }


    [HttpPost("books/imports")]
    public async Task<ActionResult<ImportBookDto>> CreateImportBook([FromBody] CreateImportBookRequest request)
    {
        var importBook = _mapper.Map<ImportBook>(request);
        importBook.StockQuantity = importBook.InitialStockQuantity;
        await _bookService.InsertImportBookAsync(importBook);
        return Ok(new { message = " Thành công" });
    }
    [HttpPost("books/inventory")]
    public async Task<IActionResult> GetBookProfitReport([FromBody] BookProfitReportRequest request)
    {
        var result = await _bookService.GetBookProfitReportAsync(request);
        return Ok(result);
    }

    [HttpDelete("books/imports/{id}")]
    public async Task<ActionResult> DeleteImportBook(int id)
    {
        await _bookService.DeleteImportBookAsync(id);
        return Ok(new { message = "Thành công" });
    }

    [HttpPost("books/imports/search")]
    public async Task<ActionResult<List<ImportBookDto>>> SearchImportBooks([FromBody] SearchImportRequest request)
    {

        var pagedImportBooks = await _bookService.GetAllImportBooksAsync(
            keyword: request.Keyword,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );
        var items = pagedImportBooks.Items.Select(b => _mapper.Map<ImportBookDto>(b)).ToList();
        var result = new PagedList<ImportBookDto>(items, pagedImportBooks.PageIndex, pagedImportBooks.PageSize, pagedImportBooks.TotalCount);
        return Ok(result);
    }


    #endregion

    #region custom attributes

    [HttpGet("books/{bookId}/custom-attributes")]
    public async Task<IActionResult> GetCustomAttributes([FromRoute] int bookId)
    {
        var book = await _bookService.GetBookAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = $"Book with ID {bookId} not found." });
        }
        var customAttributes = await _bookService.GetCustomAttributesAsync(bookId);
        var customAttributesDto = customAttributes.Items
            .Select(ca => _mapper.Map<CustomAttributeDto>(ca))
            .ToList();
        var result = new PagedList<CustomAttributeDto>(customAttributesDto, customAttributes.PageIndex, customAttributes.PageSize, customAttributes.TotalCount);
        return Ok(customAttributes);
    }

    [HttpGet("books/{bookId}/custom-attributes/{id}")]
    public async Task<IActionResult> GetCustomAttribute([FromRoute] int bookId, [FromRoute] int id)
    {
        var book = await _bookService.GetBookAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = $"Book with ID {bookId} not found." });
        }
        var customAttribute = await _bookService.GetCustomAttributeAsync(id);
        if (customAttribute == null)
        {
            return NotFound(new { message = $"Custom attribute with ID {id} not found." });
        }
        var customAttributeDto = _mapper.Map<CustomAttributeDto>(customAttribute);
        return Ok(customAttributeDto);
    }

    [HttpPost("books/{bookId}/custom-attributes")]
    public async Task<IActionResult> CreateCustomAttribute([FromRoute] int bookId, [FromBody] CreateCustomAttributeRequest request)
    {
        var book = await _bookService.GetBookAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = $"Book with ID {bookId} not found." });
        }
        var customAttribute = _mapper.Map<CustomAttribute>(request);
        customAttribute.BookId = bookId;
        await _bookService.CreateCustomAttributeAsync(request);
        return Ok(customAttribute);
    }

    [HttpDelete("books/{bookId}")]
    public async Task<IActionResult> DeleteBook([FromRoute] int bookId)
    {
        var book = await _bookService.GetBookAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = $"Book with ID {bookId} not found." });
        }
        await _bookService.DeleteBookAsync(book);
        return Ok(new { message = "Thành công" });
    }

    [HttpPut("books/{bookId}/custom-attributes")]
    public async Task<IActionResult> UpdateCustomAttribute([FromRoute] int bookId, [FromBody] CreateCustomAttributeRequest request)
    {
        var book = await _bookService.GetBookAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = $"Book with ID {bookId} not found." });
        }
        var customAttribute = await _bookService.GetCustomAttributeAsync(request.Id);
        if (customAttribute == null)
        {
            return NotFound(new { message = $"Custom attribute with ID {request.Id} not found." });
        }
        await _bookService.UpdateCustomAttributeAsync(request.Id, request);
        return Ok(new {message = "Thành công "});
    }

    [HttpDelete("books/{bookId}/custom-attributes/{id}")]
    public async Task<IActionResult> DeleteCustomAttribute([FromRoute] int bookId, [FromRoute] int id)
    {
        var book = await _bookService.GetBookAsync(bookId);
        if (book == null)
        {
            return NotFound(new { message = $"Book with ID {bookId} not found." });
        }
        var customAttribute = await _bookService.GetCustomAttributeAsync(id);
        if (customAttribute == null)
        {
            return NotFound(new { message = $"Custom attribute with ID {id} not found." });
        }
        await _bookService.DeleteCustomAttributeAsync(id);
        return Ok((new { message = "Thành công " }));
    }




    #endregion

}
