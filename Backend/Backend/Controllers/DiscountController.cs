using AutoMapper;
using Backend.Common;
using Backend.DTO.Discounts;
using Backend.Services.Cart;
using Backend.Services.Discounts;
using Backend.Services.Shipping;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class DiscountController : PublicController
{

    private readonly IDiscountService _discountService;

    private readonly ICartService _cartService;

    private readonly IMapper _mapper;

    private readonly IShippingService _shippingService;


    public DiscountController(IDiscountService discountService, ICartService cartService, IMapper mapper, IShippingService shippingService)
    {
        _discountService = discountService ?? throw new ArgumentNullException(nameof(discountService), "Discount service is not initialized.");
        _cartService = cartService ?? throw new ArgumentNullException(nameof(cartService), "Cart service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
        _shippingService = shippingService ?? throw new ArgumentNullException(nameof(shippingService), "Shipping service is not initialized.");
    }

    [HttpPost("discounts/check")]
    public async Task<IActionResult> Check([FromBody] DiscountCheckRequest model)
    {
     
        if(model == null)
            return BadRequest("Invalid request data.");
        if (model.CartItemIds == null || model.CartItemIds.Count == 0)
            return BadRequest("Danh sách sản phẩm trong giỏ hàng không được để trống.");          
        var cartItems = await _cartService.GetCartItemsByIdsAsync(GetUserId() , model.CartItemIds);
        //if (!await _shippingService.HasAvailableInventoryForAllAsync(cartItems))
        //{
        //    return Ok(Invalid("Sản phẩm bạn vừa chọn hiện không còn hàng trong cùng cửa hàng với các sản phẩm đã chọn trước đó." +
        //        " Bạn có thể đặt sản phẩm này sau khi hoàn tất đơn hàng hiện tại."));
        //}

        if (string.IsNullOrEmpty(model.DiscountCode))
        {

            var total = await _discountService.CalculateCartTotalAsync(cartItems);
            var r = new DiscountCalculationResult
            {
                IsValid = true,
                Message = "",
                TotalBeforeDiscount = total,
                DiscountableAmount = 0,
                DiscountAmount = 0
            };
            return Ok(r);
        }
        var userId = GetUserId();
        var result = await _discountService.CalculateDiscountAsync(model.DiscountCode, model.CartItemIds, userId);
        return Ok(result);
    }

    [HttpGet("discounts/public")]
    public async Task<IActionResult> GetPublicDiscounts()
    {
        var discounts = await _discountService.GetAllDiscountsPublicAsync();
        if (discounts == null || !discounts.Any())
            return NotFound("Không tìm thấy mã giảm giá công khai.");
        var discountDtos = _mapper.Map<List<DiscountDto>>(discounts);
        return Ok(discountDtos);
    }

    [HttpGet("discounts/{id}")]
    public async Task<IActionResult> GetDiscount([FromRoute] int id)
    {
        var discount = await _discountService.GetDiscountByIdAsync(id);
        var discountDto = _mapper.Map<DiscountDto>(discount);
        return Ok(discountDto);
    }

    [HttpPost("discounts/available")]
    public async Task<IActionResult> GetAvailableDiscounts([FromBody] DiscountCheckRequest model)
    {
        if (model == null)
            return BadRequest("Invalid request data.");
        if (model.CartItemIds == null || model.CartItemIds.Count == 0)
            return BadRequest("Danh sách sản phẩm trong giỏ hàng không được để trống.");
        var cartItems = await _cartService.GetCartItemsByIdsAsync(GetUserId(), model.CartItemIds);

        var total = await _discountService.CalculateCartTotalAsync(cartItems);
        var discounts = await _discountService.GetAvailableDiscountsAsync(GetUserId(), total, cartItems);
        var discountDtos = _mapper.Map<List<DiscountDto>>(discounts);
        return Ok(discountDtos);
    }

    [HttpGet("/discounts/by-code/{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return BadRequest("Mã giảm giá không được để trống.");

        var discount = await _discountService.GetDiscountByCodeAsync(code);

        if (discount == null)
            return NotFound("Không tìm thấy mã giảm giá.");

         return Ok(discount);
    }

    [HttpGet("discounts/random")]
    public async Task<IActionResult> GetRandomDiscount()
    {
        var discounts = await _discountService.GetRandomDiscountsAsync();
        if (discounts == null)
            return NotFound("Không tìm thấy mã giảm giá.");
        var discountDto =  _mapper.Map<List<DiscountDto>>(discounts);
        return Ok(discountDto);
    }

    private DiscountCalculationResult Invalid(string message, decimal totalBefore = 0, decimal discountable = 0)
    {
        return new DiscountCalculationResult
        {
            IsValid = false,
            Message = message,
            TotalBeforeDiscount = totalBefore,
            DiscountableAmount = discountable,
            DiscountAmount = 0
        };
    }

}
