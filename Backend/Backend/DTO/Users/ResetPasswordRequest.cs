namespace Backend.DTO.Users;

public class ResetPasswordRequest
{
    public string Otp { get; set; }

    public string Email { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}
