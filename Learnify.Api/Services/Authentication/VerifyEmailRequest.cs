namespace Learnify.Api.DTOs.Authentication;

public class VerifyEmailRequest
{
    public string Uid { get; set; } = string.Empty;

    public string Otp { get; set; } = string.Empty;
}