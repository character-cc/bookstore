using Backend.Common;
using Backend.DTO.Cart;
using Microsoft.Identity.Client;

namespace Backend.Controllers;
using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Cart;
using Backend.Services.Cart;
using Backend.Services.Products;
using Microsoft.AspNetCore.Mvc;
public class CartController : PublicController
{

    private readonly ICartService _cartService;

    private readonly IBookService _bookService;

    private readonly IMapper _mapper;


    public CartController(ICartService cartService, IBookService bookService, IMapper mapper)
    {
        _cartService = cartService ?? throw new ArgumentNullException(nameof(cartService), "Cart service is not initialized.");
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService), "Book service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
    }

    [HttpPost("cart")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        if (request == null || request.BookId <= 0 || request.Quantity <= 0)
            return BadRequest("Invalid request data.");
        var result = await _cartService.AddToCartAsync(GetUserId(),request.BookId, request.Quantity, request.AttributeValueIds);
        if (result)
            return Ok(new {messeage = "Thêm tới giỏ hàng thành công"});
        var quantity = await _bookService.GetStockQuantityAsync(request.BookId);
        return BadRequest(new { quantity = quantity, messeage = "Sản phẩm đã hết hàng bạn hãy quay lại vào thời gian khác" });
    }

    [HttpGet("cart")]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        var cartItems = await _cartService.GetCartItemsAsync(userId);
        var cartItemsDto = _mapper.Map<IList<CartItemDto>>(cartItems);
        return Ok(cartItems);
    }

    [HttpPut("cart/{cartItemId}/quantity")]
    public async Task<IActionResult> UpdateCartItemQuantity(int cartItemId, [FromBody] UpdateCartQuantityRequest updateCartQuantityRequest)
    {


            var result = await _cartService.UpdateQuantityCartAsync(cartItemId, updateCartQuantityRequest.Quantity);
        if (!result)
            {
            return BadRequest(new { message = "Số lượng sản phẩm trong giỏ hàng vượt quá tồn hàng " });
        }
      
            return Ok(new { message = "Cập nhật số lượng giỏ hàng thành công" });
    }

    [HttpDelete("cart/{cartItemId}")]
    public async Task<IActionResult> DeleteCartItem(int cartItemId)
    {
       
            await _cartService.DeleteCartItemAsync(cartItemId);
            return Ok(new { message = "Xoá sản phẩm khỏi giỏ hàng thành công" });
       
    }
}
