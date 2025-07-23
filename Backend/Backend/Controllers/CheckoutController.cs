using Backend.Common;

namespace Backend.Controllers;

using AutoMapper;
using Backend.DTO.Cart;
using Backend.DTO.Checkouts;
using Backend.DTO.Discounts;
using Backend.DTO.Orders;
using Backend.Services.Discounts;
using Backend.Services.Orders;
using Backend.Services.Shipping;
using Backend.Services.Users;
using Microsoft.AspNetCore.Mvc;

public class CheckoutController : PublicController
{

    private readonly ICheckoutService _checkoutService;

    private readonly IDiscountService _discountService;

    private readonly IUserService _userService;

    private readonly IMapper _mapper;

    private readonly IShippingService _shippingService;



    public CheckoutController(
        ICheckoutService checkoutService,
        IDiscountService discountService,
        IUserService userService,
        IMapper mapper,
        IShippingService shippingService)
    {
        _checkoutService = checkoutService ?? throw new ArgumentNullException(nameof(checkoutService), "Checkout service is not initialized.");
        _discountService = discountService ?? throw new ArgumentNullException(nameof(discountService), "Discount service is not initialized.");
        _userService = userService ?? throw new ArgumentNullException(nameof(userService), "User service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
        _shippingService = shippingService ?? throw new ArgumentNullException(nameof(shippingService), "Shipping service is not initialized.");
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        if (request == null || request.CartItemIds == null || !request.CartItemIds.Any())
        {
            return BadRequest("Invalid checkout request.");
        }
        int userId = GetUserId();
        await _checkoutService.CreateCheckoutAsync(userId, request.CartItemIds, request.DiscountCode);
        return Ok(new { message = "Checkout successful." });
    }

    [HttpGet("checkout/items")]
    public async Task<IActionResult> GetItems()
    {
        int userId = GetUserId();
        var checkouts = await _checkoutService.GetCartItemsOfCheckout(userId);
        var checkoutDtos = _mapper.Map<IList<CartItemDto>>(checkouts);
        return Ok(checkoutDtos);
    }

    [HttpGet("checkout/calculate")]
    public async Task<IActionResult> CalculateTotal()
    {
        int userId = GetUserId();
        var cartItemsOfCheckout = await _checkoutService.GetCartItemsOfCheckout(userId);
        var cartItemsIds = cartItemsOfCheckout.Select(ci => ci.Id).ToList();
        var discount = await _checkoutService.GetDiscountByUserIdAsync(userId);

        if(discount == null)
        {
                var total = await _discountService.CalculateCartTotalAsync(cartItemsOfCheckout.ToList());
                var r = new DiscountCalculationResult
                {
                    IsValid = true,
                    Message = "",
                    DiscountCode = null,
                    TotalBeforeDiscount = total,
                    DiscountableAmount = 0,
                    DiscountAmount = 0
                };
                return Ok(r);
        }
        var result = await _discountService.CalculateDiscountAsync(discount?.Code  ,cartItemsIds, userId);
        return Ok(result);

    }


    [HttpPost("shipping")]
    public async Task<IActionResult> GetShipping([FromBody] OrderRequest request)
    {
         var address = await _userService.GetAddressByAddressIdAsync(request.AddressId);
        if (address == null)
        {
            return BadRequest("Invalid address.");
        }
        var userId = GetUserId();
        var result = await _shippingService.CalculateCheapestShippingFeeAsync(userId, address);
        if (result == null)
        {
            return BadRequest("Có lỗi xảy ra");
        }
        return Ok(result);

    }
}
