using Learnify.Api.DTOs.Authentication;

namespace Learnify.Api.Services.Authentication;

public interface IAuthenticationService
{
    Task<AuthResponse> RegisterAsync(
        RegisterRequest request
    );

    Task<AuthResponse> LoginAsync(
        LoginRequest request
    );

    Task<AuthResponse> GetCurrentUserAsync(
        string uid
    );

    Task<AuthResponse> VerifyEmailOtpAsync(
        string uid,
        string otp
    );

    Task<AuthResponse> SendEmailVerificationAsync(
        string uid
    );

    Task<AuthResponse> SendPasswordResetOtpAsync(
        ForgotPasswordRequest request
    );

    Task<AuthResponse> VerifyPasswordResetOtpAsync(
        VerifyPasswordResetRequest request
    );

    Task<AuthResponse> ResetPasswordAsync(
        ResetPasswordRequest request
    );

    Task<AuthResponse> LoginWithGoogleAsync(
        string idToken
    );
}