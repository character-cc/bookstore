using System.Security.Claims;
using AutoMapper;
using Backend.Common;
using Backend.Common.Utils;
using Backend.Data.Domain.Users;
using Backend.Data.Domain.Users.Enum;
using Backend.DTO.Users;
using Backend.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;


public class UserController : PublicController
{

    private readonly IUserService _userService;

    private readonly IMapper _mapper;

    public UserController(IUserService userService, IMapper mapper)
    {
        _userService = userService;
        _mapper = mapper;
    }

    [HttpGet("users/me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = GetUserId();
        if (userId <= 0)
        {
            return Unauthorized(new { message = "Bạn cần đăng nhập để truy cập thông tin người dùng" });
        }
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + userId });
        }
        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }


    [HttpGet("users/me/profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + userId });
        }
        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }

    [HttpPut("users/me/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid user data" });
        }
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + userId });
        }
        _mapper.Map(request, user);
        await _userService.UpdateUserAsync(user);
        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }

    [HttpPut("users/me/password")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.NewPassword) || string.IsNullOrEmpty(request.OldPassword))
        {
            return BadRequest(new { message = "Invalid password data" });
        }
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + userId });
        }
        if (Hasher.VerifyHashedPassword(user,user.PasswordHash, request.OldPassword) == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
        {
            return BadRequest(new { message = "Mật khẩu cũ không chính xác" });
        }
        
        user.PasswordHash = Hasher.HashPassword(request.NewPassword);
        await _userService.UpdateUserAsync(user);
        return Ok(new { message = "Mật khẩu đã được cập nhật thành công" });
    }

    [HttpPost("users/me/addresses")]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid address data" });
        }
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + request.UserId });
        }
        var address = _mapper.Map<Address>(request);
        address.User = user;
        address.UserId = userId;
        await _userService.InsertAddressAsync(address);
        var addressDto = _mapper.Map<AddressDto>(address);
        return Ok(addressDto);
    }

    [HttpPut("users/me/addresses")]
    public async Task<IActionResult> UpdateAddress([FromBody] UpdateAddressRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid address data" });
        }
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + request.UserId });
        }
        var address = await _userService.GetAddressByAddressIdAsync(request.Id);
        _mapper.Map(request, address);
        address.User = user;
        address.UserId = userId;
        await _userService.UpdateAddressAsync(address);
        var addressDto = _mapper.Map<AddressDto>(address);
        return Ok(addressDto);
    }

    [HttpPut("users/me/addresses/{id}/set-default")]
    public async Task<IActionResult> SetDefaultAddress([FromRoute] int id)
    {
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + userId });
        }
        var address = await _userService.GetAddressByAddressIdAsync(id);
        if (address == null || address.UserId != userId)
        {
            return NotFound(new { message = "Địa chỉ không được tìm thấy hoặc không thuộc về người dùng này" });
        }
        address.IsDefault = true;
        await _userService.UpdateAddressAsync(address);
        return Ok(new { message = "Địa chỉ đã được đặt làm mặc định thành công" });
    }

    [HttpDelete("users/me/addresses/{id}")]
    public async Task<IActionResult> DeleteAddress([FromRoute] int id)
    {
        var userId = GetUserId();
        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy với ID " + userId });
        }
        var address = await _userService.GetAddressByAddressIdAsync(id);
        if (address == null || address.UserId != userId)
        {
            return NotFound(new { message = "Địa chỉ không được tìm thấy hoặc không thuộc về người dùng này" });
        }
        await _userService.DeleteAddressAsync(address);
        return Ok(new { message = "Địa chỉ đã được xóa thành công" });
    }


    [HttpGet("users/enum/genders")]
    public IActionResult GetGenders()
    {
        var result = EnumHelper.ToList<Gender>();
        return Ok(result);
    }

    [HttpGet("users/enum/address-types")]
    public IActionResult GetAddressTypes()
    {
        var result = EnumHelper.ToList<AddressType>();
        return Ok(result);
    }

    [HttpGet("users/me/addresses")]
    public async Task<IActionResult> GetAllAddress()
    {
        var addresses = await _userService.GetAddressesByUserIdAsync(GetUserId());
        return Ok(_mapper.Map<List<Address>>(addresses));
    }

    //[HttpPost("users/me/addresses")]
    //public async Task<IActionResult> CreateAddress(CreateAddressRequest request)
    //{
    //    var address = _mapper.Map<Address>(request);
    //    await _userService.InsertAddressAsync(address);
    //    return CreatedAtAction(nameof(GetAllAddress), new { id = address.Id }, address);
    //}
   
    [HttpGet("users/{userId:int}")]
    public async Task<IActionResult> GetUserAsync(int userId)
    {
        var user = await _userService.GetUserByIdAsync(userId); 
        if (user == null)
        {
            return NotFound(new { message = "Người dùng không được tìm thấy " + userId }); 
        }
        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }

    
}

