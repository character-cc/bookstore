using Azure.Core;
using Backend.Common;
using Backend.Common.Utils;
using Backend.Data.Domain.Users;
using Backend.Data.Domain.Users.Enum;
using Backend.DTO.Identity;
using Backend.DTO.Users;
using Backend.Services.Identity;
using Backend.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;
public class IdentityController : PublicController
{
    private readonly IIdentityService _identityService;

    private readonly IUserService _userService;

    public IdentityController(IIdentityService identityService, IUserService userService)
    {
        _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService), "Identity service is not initialized.");
        _userService = userService ?? throw new ArgumentNullException(nameof(userService), "User service is not initialized.");
    }

    [HttpPost("login")]
    public virtual async Task<IActionResult> Login([FromBody] DTO.Identity.LoginRequest loginModel)
    {
 
            if (await _identityService.IsUserLoggedIn())
            {
                return BadRequest(new { message = "You are already logged in." });
            }
            var usernameOrEmail = loginModel.UsernameOrEmail.Trim();
            var password = loginModel.Password;
            var loginResult = await _identityService.ValidateSignInAsync(usernameOrEmail, password);
            switch (loginResult)
            {
                case UserLoginResult.Successful:
                    {
                        var customer = await _userService.GetUserByUsernameOrEmailAsync(usernameOrEmail);
                        await _identityService.SignInCustomerAsync(customer, loginModel.RememberMe);
                        return Ok(new { customer = new { customer.Id, customer.Username, customer.Email } });
                    }

                case UserLoginResult.CustomerNotExist:
                    return Unauthorized(new { message = "User does not exist." });
                case UserLoginResult.Deleted:
                    return Unauthorized(new { message = "User account has been deleted." });
                case UserLoginResult.NotActive:
                    return Unauthorized(new { message = "User account is not active." });
                case UserLoginResult.WrongPassword:
                    return Unauthorized(new { message = "Incorrect password." });
                default:
                    return BadRequest(new { message = "An unexpected error occurred." });
            }
        

    }



    [HttpPost("users/register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest model)
    {

        if (await _identityService.IsUserLoggedIn())
        {
            return BadRequest(new { message = "You are already logged in." });
        }
        if (!await _userService.VerifyOtpAsync(model.Email, model.Otp))
        {
            return BadRequest(new { message = "OTP không hợp lệ" });
        }
        var result = await _identityService.RegisterCustomerAsync(model);
        switch (result)
        {
            case UserRegisterResult.Successful:
                {
                    var user = await _userService.GetUserByUsernameOrEmailAsync(model.Username);
                    await _identityService.SignInCustomerAsync(user, true);
                    return Ok(new { message = "Registration successful." });
                }

            case UserRegisterResult.InvalidModelState:
                return BadRequest(ModelState);
            case UserRegisterResult.UsernameOrEmailAlreadyExists:
                return BadRequest(new { message = "Username or email already exists." });
            default:
                return BadRequest(new { message = "An unexpected error occurred." });
        }

    }

    [HttpPost("users/check")]
    public async Task<IActionResult> Check([FromBody] CheckUserExitRequest request)
    {
        var user = await _userService.GetUserByUsernameOrEmailAsync(request.Username);
        if (user != null)
        {
            return BadRequest(new {message = "Username đã tồn tại"});
        }
        user = await _userService.GetUserByEmailAsync(request.Email);
        if (user != null)
        {
            return BadRequest(new { message = "Email đã tồn tại" });
        }
        return Ok(new { message = "Username và Email đều không tồn tại" });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _identityService.SignOutCustomerAsync();
        return Ok(new { message = "Logged out successfully" });
    }


    [HttpPost("users/otp/reset-password")]
    public async Task<IActionResult> CreateOtpResetPassword([FromBody] OtpRequest request)
    {
        var user = await _userService.GetUserByUsernameOrEmailAsync(request.Email);
        if (user == null)
            return BadRequest(new { message = "Email không tồn tại" });

        await _userService.SendOtpAsync(request.Email);
        return Ok(new { message = "OTP đã được gửi đến email của bạn" });
    }

    [HttpPost("users/otp/register")]
    public async Task<IActionResult> CreateOtpRegister([FromBody] OtpRequest request)
    {
        var user = await _userService.GetUserByUsernameOrEmailAsync(request.Email);
        if (user != null)
            return BadRequest(new { message = "Email này đã được đăng ký" });

        await _userService.SendOtpAsync(request.Email);
        return Ok(new { message = "OTP đã được gửi đến email của bạn" });
    }



    [HttpPost("users/reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp) || string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest(new { message = "Email, OTP, and new password are required." });
        }
        if (!await _userService.VerifyOtpAsync(request.Email, request.Otp))
        {
            return BadRequest(new { message = "Invalid OTP." });
        }
        var user = await _userService.GetUserByUsernameOrEmailAsync(request.Email);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }
        user.PasswordHash = Hasher.HashPassword(request.NewPassword);
        await _userService.UpdateUserAsync(user);
        return Ok(new { message = "Password reset successfully." });
    }
}
