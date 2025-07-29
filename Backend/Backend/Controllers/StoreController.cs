using AutoMapper;
using Backend.Common;
using Backend.DTO.Stores;
using Backend.Services.Products;
using Backend.Services.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class StoreController : PublicController
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

    [HttpGet("stores")]
    public async Task<IActionResult> GetStoreAsync()
    {
        var store = await _storeService.GetStoreAsync();
        var storeDto = _mapper.Map<StoreDto>(store);
        return Ok(storeDto);
    }
}
