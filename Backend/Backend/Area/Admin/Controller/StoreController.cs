using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Stores;
using Backend.DTO.Products;
using Backend.DTO.Stores;
using Backend.Services.Products;
using Backend.Services.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class StoreController : AdminController
{

    private readonly IStoreService _storeService;

    private readonly IBookService _bookService;

    private readonly IMapper _mapper;


    public StoreController(IStoreService storeService, IBookService bookService, IMapper mapper)
    {
        _storeService = storeService ?? throw new ArgumentNullException(nameof(storeService), "Store service is not initialized.");
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService), "Book service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
    }

    [HttpPost("stores")]
    public async Task<IActionResult> CreateStoreAsync([FromBody] CreateOrUpdateStoreRequest storeDto)
    {
        if (storeDto == null)
            return BadRequest("Store data is required.");
        var store = _mapper.Map<Store>(storeDto);
        await _storeService.CreateStoreAsync(store);
        return Ok(new { message = "Store created successfully." });
    }

    [HttpPut("stores")]
    public async Task<IActionResult> UpdateStoreAsync([FromBody] CreateOrUpdateStoreRequest storeDto)
    {
        if (storeDto == null)
            return BadRequest("Store data is required.");
        var existingStore = await _storeService.GetStoreAsync();
        existingStore = _mapper.Map(storeDto, existingStore);
        await _storeService.UpdateStoreAsync(existingStore);
        return Ok(new { message = "Store updated successfully." });
    }

    [HttpGet("store")]
    public async Task<IActionResult> GetStoreAsync()
    {
        var store = await _storeService.GetStoreAsync();
        var storeDto =  _mapper.Map<StoreDto>(store);
        return Ok(storeDto);
    }

    [HttpPost("stores/{id}/search")]
    public async Task<IActionResult> GetStoreBooksAsync([FromBody] GetBooksOfInventoryStoreRequest request)
    {
        var store = await _storeService.GetStoreByIdAsync(request.StoreId);
        if (store == null)
            return NotFound("Store not found.");

        var storeBooks = await _storeService.GetPagedStoreBooksAsync(request.StoreId, request.Keyword,request.StockFilter,
            request.PageIndex, request.PageSize);

        var storeBooksDto = storeBooks.Items.Select(sb => _mapper.Map<StoreBookDto>(sb)).ToList();

        var result = new PagedList<StoreBookDto>(storeBooksDto, storeBooks.PageIndex, storeBooks.PageSize, storeBooks.TotalCount);
        return Ok(result);
    }

    [HttpGet("stores/{id}")]
    public async Task<IActionResult> GetStoreByIdAsync(int id)
    {
        var store = await _storeService.GetStoreByIdAsync(id);
        if (store == null)
            return NotFound("Store not found.");
        var storeDto = _mapper.Map<StoreDto>(store);
        return Ok(storeDto);
    }


    [HttpPost("books/inventory-store")]
    public async Task<IActionResult> GetBooksByInventoryStore([FromBody] GetBooksOfInventoryStoreRequest request)
    {
        var pagedBooks = await _bookService.GetBooksOfStoreInventoryAsync(
            storeId: request.StoreId,
            keyword: request.Keyword,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );
        var items = pagedBooks.Items.Select(b => _mapper.Map<BookDto>(b)).ToList();
        var result = new PagedList<BookDto>(items, pagedBooks.PageIndex, pagedBooks.PageSize, pagedBooks.TotalCount);
        return Ok(result);
    }

    [HttpPost("stores/{storeId}/inventory")]
    public async Task<IActionResult> InsertStoreBooksAsync(int storeId, [FromBody] CreateStoreBookRequest request)
    {
        if (request == null || !request.BookIds.Any())
            return BadRequest("Store books data is required.");
        await _storeService.CreateStoreBooksAsync(storeId, request.BookIds);
        return Ok(new { message = "Store books added successfully." });
    }

    [HttpPut("stores/{storeId}/inventory/{bookId}")]
    public async Task<IActionResult> UpdateStoreBookAsync([FromRoute] int storeId, [FromRoute] int bookId, 
        [FromBody] CreateOrUpdateStoreBookRequest storeBookDto)
    {
        if (storeBookDto == null)
            return BadRequest("Store book data is required.");
        var storeBook = await _storeService.GetStoreBookByIdAsync(storeId, bookId);
        storeBook = _mapper.Map(storeBookDto, storeBook);
        storeBook.StoreId = storeId;
        storeBook.BookId = bookId;
        await _storeService.UpdateStoreBooksAsync(storeBook);
        return Ok(new { message = "Store book updated successfully." });
    }
}
