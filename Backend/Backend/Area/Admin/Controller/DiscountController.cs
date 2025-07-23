using AutoMapper;
using Backend.Common;
using Backend.Data.Domain.Discounts;
using Backend.DTO.Discounts;
using Backend.DTO.Products;
using Backend.DTO.Roles;
using Backend.Services.Discounts;
using Backend.Services.Email;
using Backend.Services.Users;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class DiscountController : AdminController
{
    private readonly IDiscountService _discountService;

    private readonly IMapper _mapper;

    private readonly IEmailTemplateService _emailTemplateService;

    private readonly IEmailSender _emailSender;

    private readonly IUserService _userService;



    public DiscountController(IDiscountService discountService, IMapper mapper, IEmailTemplateService emailTemplateService, IEmailSender emailSender, IUserService userService)
    {
        _discountService = discountService ?? throw new ArgumentNullException(nameof(discountService), "Discount service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
        _emailTemplateService = emailTemplateService ?? throw new ArgumentNullException(nameof(emailTemplateService), "Email template service is not initialized.");
        _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender), "Email sender is not initialized.");
        _userService = userService ?? throw new ArgumentNullException(nameof(userService), "User service is not initialized.");
    }

    [HttpGet("discounts/{id}")]
    public async Task<IActionResult> GetDiscount([FromRoute] int id)
    {
        var discount = await _discountService.GetDiscountByIdAsync(id);
        var discountDto = _mapper.Map<DiscountDto>(discount);
        return Ok(discountDto);
    }

    [HttpPost("discounts/search")]
    public async Task<IActionResult> GetDiscounts([FromBody] GetDiscountsRequest request)
    {

        var pagedDiscounts = await _discountService.GetDiscountsAsync(
            code: request.Code,
            startDate: request.StartDate,
            endDate: request.EndDate,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize
        );

        var items = pagedDiscounts.Items.Select(d => _mapper.Map<DiscountDto>(d)).ToList();
        var pagedResult = new PagedList<DiscountDto>(items, request.PageIndex, request.PageSize, pagedDiscounts.TotalCount);
        return Ok(pagedResult);
    }

    [HttpPost("discounts/select-books")]
    public async Task<IActionResult> SearchBooksForDiscount([FromBody] SearchBooksForDiscountRequest request)
    {
        var books = await _discountService.SearchBooksForDiscountAsync(
            keyword: request.Keyword,
            discountId: request.DiscountId,
            isSelectingForApplicable: request.IsSelectingForApplicable,
            pageIndex: request.PageIndex,
            pageSize: request.PageSize);
        var booksDto = books.Select(b => _mapper.Map<BookDto>(b)).ToList();
        return Ok(books);
    }

    [HttpGet("discounts/{discountId}/roles")]
    public async Task<IActionResult> GetRoles(int discountId)
    {
        var result = await _discountService.GetSelectedRolesAsync(discountId);
        var rolesDto = result.Select(r => _mapper.Map<RoleDto>(r)).ToList();
        return Ok(result);
    }

    [HttpGet("discounts/{discountId}/applicable-books")]
    public async Task<IActionResult> GetApplicableBooks(int discountId)
    {
        var result = await _discountService.GetApplicableBooksAsync(discountId);
        var booksDto = result.Select(b => _mapper.Map<BookDto>(b)).ToList();
        return Ok(booksDto);
    }

    [HttpGet("discounts/{discountId}/excluded-books")]
    public async Task<IActionResult> GetExcludedBooks(int discountId)
    {
        var result = await _discountService.GetExcludedBooksAsync(discountId);
        var booksDto = result.Select(b => _mapper.Map<BookDto>(b)).ToList();
        return Ok(booksDto);
    }

    [HttpPost("discounts")]
    public async Task<IActionResult> CreateDiscount([FromBody] DiscountCreateOrUpdateDto dto)
    {
        var discount = await _discountService.GetDiscountByCodeAsync(dto.Code);
        if (discount != null)
        {
            return BadRequest( new { message = "Mã Code trùng với giảm giá đã tồn tại." });
        }
        var discountId = await _discountService.CreateDiscountAsync(dto);
        return Ok(new { Id = discountId });
    }

    [HttpPut("discounts/{id}")]
    public async Task<IActionResult> UpdateDiscount(int id, [FromBody] DiscountCreateOrUpdateDto dto)
    {
        var discount = await _discountService.GetDiscountByCodeAsync(dto.Code);
        if (discount != null && discount.Id != id)
        {
            return BadRequest(new { message = "Mã Code trùng với giảm giá đã tồn tại." });
        }
        await _discountService.UpdateDiscountAsync(id, dto);
        return NoContent();
    }


    [HttpPost("discounts/send-email")]
    public async Task<IActionResult> SendDiscount([FromBody] SendDiscountToEmailRequest request)
    {
        var discount = await _discountService.GetDiscountByIdAsync(request.DiscountId);
        var users = await _userService.GetUsersByIdsAsync(request.UserIds);
        var html = await _emailTemplateService.RenderDiscountEmailAsync(discount);

        //var recipients = new List<string> { "tops182000@gmail.com" };

        foreach (var email in users.Select(u => u.Email))
        {
            await _emailSender.SendEmailAsync(email, "Ưu đãi dành riêng cho bạn", html);
        }

        return Ok("Đã gửi mã tới người dùng được chọn.");
    }

    [HttpDelete("discounts/{id}")]
    public async Task<IActionResult> DeleteDiscount(int id)
    {
        var discount = await _discountService.GetDiscountByIdAsync(id);
        if (discount == null)
        {
            return NotFound("Discount not found.");
        }
        await _discountService.DeleteDiscountAsync(discount);
        return NoContent();
    }

}
