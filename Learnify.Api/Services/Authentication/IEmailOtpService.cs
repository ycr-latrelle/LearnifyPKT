namespace Learnify.Api.Services.Authentication;

public interface IEmailOtpService
{
    Task<bool> SendVerificationOtpAsync(
        string uid,
        string email,
        string name
    );

    Task<bool> VerifyOtpAsync(
        string uid,
        string otp
    );

    Task<bool> SendPasswordResetOtpAsync(
        string uid,
        string email,
        string name
    );

    Task<bool> VerifyPasswordResetOtpAsync(
        string uid,
        string otp
    );

    Task DeletePasswordResetOtpAsync(
        string uid
    );
}