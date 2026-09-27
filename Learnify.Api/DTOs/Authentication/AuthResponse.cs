namespace Learnify.Api.DTOs.Authentication;

public class AuthResponse
{
    public bool Success { get; set; }

    public string Message { get; set; } =
        string.Empty;

    public string? Uid { get; set; }

    public string? Email { get; set; }

    public string? Name { get; set; }

    public string? IdToken { get; set; }

    public string? ResetToken { get; set; }
}