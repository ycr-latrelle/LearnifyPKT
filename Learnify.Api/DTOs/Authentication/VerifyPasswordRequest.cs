namespace Learnify.Api.DTOs.Authentication;

public class VerifyPasswordResetRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}