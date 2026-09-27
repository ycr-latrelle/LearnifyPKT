using Learnify.Api.DTOs.Authentication;
using Learnify.Api.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Learnify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;

    public AuthController(
        IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    // ==================================================
    // REGISTER
    // ==================================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request)
    {
        var result =
            await _authenticationService
                .RegisterAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    // ==================================================
    // LOGIN
    // ==================================================

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        var result =
            await _authenticationService
                .LoginAsync(request);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    // ==================================================
    // VERIFY EMAIL
    // ==================================================

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(
        [FromBody] VerifyEmailRequest request)
    {
        var result =
            await _authenticationService
                .VerifyEmailOtpAsync(
                    request.Uid,
                    request.Otp
                );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    // ==================================================
    // RESEND VERIFICATION
    // ==================================================

    [HttpPost("resend-verification")]
    public async Task<IActionResult>
        ResendVerification(
            [FromBody] ResendVerificationRequest request)
    {
        var result =
            await _authenticationService
                .SendEmailVerificationAsync(
                    request.Uid
                );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    // ==================================================
    // FORGOT PASSWORD
    // ==================================================

    [HttpPost("forgot-password")]
    public async Task<IActionResult>
        ForgotPassword(
            [FromBody] ForgotPasswordRequest request)
    {
        var result =
            await _authenticationService
                .SendPasswordResetOtpAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    // ==================================================
    // VERIFY PASSWORD RESET OTP
    // ==================================================

    [HttpPost("verify-password-reset")]
    public async Task<IActionResult>
        VerifyPasswordReset(
            [FromBody] VerifyPasswordResetRequest request)
    {
        var result =
            await _authenticationService
                .VerifyPasswordResetOtpAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    // ==================================================
    // RESET PASSWORD
    // ==================================================

    [HttpPost("reset-password")]
    public async Task<IActionResult>
        ResetPassword(
            [FromBody] ResetPasswordRequest request)
    {
        var result =
            await _authenticationService
                .ResetPasswordAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    // ==================================================
    // CURRENT USER
    // ==================================================

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var uid =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        if (string.IsNullOrWhiteSpace(uid))
        {
            return Unauthorized();
        }

        var result =
            await _authenticationService
                .GetCurrentUserAsync(uid);

        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    // ==================================================
    // GOOGLE LOGIN
    // ==================================================

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(
    [FromBody] GoogleLoginRequest request)
    {
        var result =
            await _authenticationService
                .LoginWithGoogleAsync(request.IdToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}