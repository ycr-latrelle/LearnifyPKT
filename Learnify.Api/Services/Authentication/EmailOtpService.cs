using System.Security.Cryptography;
using System.Text;
using Google.Cloud.Firestore;
using Resend;

namespace Learnify.Api.Services.Authentication;

public class EmailOtpService : IEmailOtpService
{
    private readonly FirestoreDb _firestore;
    private readonly IResend _resend;
    private readonly IConfiguration _configuration;

    public EmailOtpService(
        FirestoreDb firestore,
        IResend resend,
        IConfiguration configuration)
    {
        _firestore = firestore;
        _resend = resend;
        _configuration = configuration;
    }

    // ==================================================
    // SEND VERIFICATION OTP
    // ==================================================

    public async Task<bool> SendVerificationOtpAsync(
        string uid,
        string email,
        string name)
    {
        var otp = GenerateOtp();
        var otpHash = HashOtp(otp);
        var expiresAt = DateTime.UtcNow.AddMinutes(10);

        var otpData = new Dictionary<string, object>
        {
            {
                "otpHash",
                otpHash
            },
            {
                "expiresAt",
                Timestamp.FromDateTime(expiresAt)
            },
            {
                "attempts",
                0
            },
            {
                "createdAt",
                Timestamp.GetCurrentTimestamp()
            }
        };

        await _firestore
            .Collection("emailVerificationOtps")
            .Document(uid)
            .SetAsync(otpData);

        var fromEmail = GetFromEmail();

        var message = new EmailMessage
        {
            From = fromEmail,

            Subject =
                "Your Learnify verification code",

            HtmlBody =
                BuildVerificationEmail(
                    name,
                    otp
                )
        };

        message.To.Add(email);

        await _resend.EmailSendAsync(message);

        Console.WriteLine(
            $"Verification OTP sent to {email}."
        );

        return true;
    }

    // ==================================================
    // VERIFY VERIFICATION OTP
    // ==================================================

    public async Task<bool> VerifyOtpAsync(
        string uid,
        string otp)
    {
        return await VerifyStoredOtpAsync(
            "emailVerificationOtps",
            uid,
            otp,
            deleteOnSuccess: true
        );
    }

    // ==================================================
    // SEND PASSWORD RESET OTP
    // ==================================================

    public async Task<bool> SendPasswordResetOtpAsync(
        string uid,
        string email,
        string name)
    {
        var otp = GenerateOtp();
        var otpHash = HashOtp(otp);
        var expiresAt = DateTime.UtcNow.AddMinutes(10);

        var otpData = new Dictionary<string, object>
        {
            {
                "otpHash",
                otpHash
            },
            {
                "expiresAt",
                Timestamp.FromDateTime(expiresAt)
            },
            {
                "attempts",
                0
            },
            {
                "verified",
                false
            },
            {
                "createdAt",
                Timestamp.GetCurrentTimestamp()
            }
        };

        await _firestore
            .Collection("passwordResetOtps")
            .Document(uid)
            .SetAsync(otpData);

        var fromEmail = GetFromEmail();

        var message = new EmailMessage
        {
            From = fromEmail,

            Subject =
                "Your Learnify password reset code",

            HtmlBody =
                BuildPasswordResetEmail(
                    name,
                    otp
                )
        };

        message.To.Add(email);

        await _resend.EmailSendAsync(message);

        Console.WriteLine(
            $"Password reset OTP sent to {email}."
        );

        return true;
    }

    // ==================================================
    // VERIFY PASSWORD RESET OTP
    // ==================================================

    public async Task<bool> VerifyPasswordResetOtpAsync(
        string uid,
        string otp)
    {
        return await VerifyStoredOtpAsync(
            "passwordResetOtps",
            uid,
            otp,
            deleteOnSuccess: false,
            markAsVerified: true
        );
    }

    // ==================================================
    // DELETE PASSWORD RESET OTP
    // ==================================================

    public async Task DeletePasswordResetOtpAsync(
        string uid)
    {
        await _firestore
            .Collection("passwordResetOtps")
            .Document(uid)
            .DeleteAsync();
    }

    // ==================================================
    // SHARED OTP VERIFICATION
    // ==================================================

    private async Task<bool> VerifyStoredOtpAsync(
        string collectionName,
        string uid,
        string otp,
        bool deleteOnSuccess,
        bool markAsVerified = false)
    {
        otp = otp.Trim();

        if (otp.Length != 6 ||
            !otp.All(char.IsDigit))
        {
            return false;
        }

        var document =
            await _firestore
                .Collection(collectionName)
                .Document(uid)
                .GetSnapshotAsync();

        if (!document.Exists)
        {
            return false;
        }

        var data =
            document.ToDictionary();

        // ----------------------------------------------
        // ALREADY VERIFIED
        // ----------------------------------------------

        if (markAsVerified &&
            data.TryGetValue(
                "verified",
                out var verifiedObject))
        {
            var verified =
                Convert.ToBoolean(verifiedObject);

            if (verified)
            {
                return false;
            }
        }

        // ----------------------------------------------
        // OTP HASH
        // ----------------------------------------------

        if (!data.TryGetValue(
                "otpHash",
                out var storedHashObject))
        {
            return false;
        }

        var storedHash =
            storedHashObject?.ToString();

        if (string.IsNullOrWhiteSpace(storedHash))
        {
            return false;
        }

        // ----------------------------------------------
        // EXPIRATION
        // ----------------------------------------------

        if (!data.TryGetValue(
                "expiresAt",
                out var expiresObject))
        {
            return false;
        }

        var expiresAt =
            ((Timestamp)expiresObject)
            .ToDateTime();

        if (DateTime.UtcNow > expiresAt)
        {
            await document.Reference.DeleteAsync();

            return false;
        }

        // ----------------------------------------------
        // ATTEMPTS
        // ----------------------------------------------

        var attempts = 0;

        if (data.TryGetValue(
                "attempts",
                out var attemptsObject))
        {
            attempts =
                Convert.ToInt32(attemptsObject);
        }

        if (attempts >= 5)
        {
            await document.Reference.DeleteAsync();

            return false;
        }

        // ----------------------------------------------
        // COMPARE OTP
        // ----------------------------------------------

        var suppliedHash =
            HashOtp(otp);

        var hashesMatch =
            CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(storedHash),
                Encoding.UTF8.GetBytes(suppliedHash)
            );

        if (!hashesMatch)
        {
            await document.Reference.UpdateAsync(
                "attempts",
                attempts + 1
            );

            return false;
        }

        // ----------------------------------------------
        // SUCCESS
        // ----------------------------------------------

        if (markAsVerified)
        {
            await document.Reference.UpdateAsync(
                "verified",
                true
            );

            return true;
        }

        if (deleteOnSuccess)
        {
            await document.Reference.DeleteAsync();
        }

        return true;
    }

    // ==================================================
    // GENERATE OTP
    // ==================================================

    private static string GenerateOtp()
    {
        return RandomNumberGenerator
            .GetInt32(100000, 1000000)
            .ToString();
    }

    // ==================================================
    // HASH OTP
    // ==================================================

    private static string HashOtp(
        string otp)
    {
        using var sha256 =
            SHA256.Create();

        var bytes =
            Encoding.UTF8.GetBytes(otp);

        var hash =
            sha256.ComputeHash(bytes);

        return Convert.ToHexString(hash);
    }

    // ==================================================
    // RESEND CONFIGURATION
    // ==================================================

    private string GetFromEmail()
    {
        var fromEmail =
            _configuration["Resend:FromEmail"];

        if (string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new InvalidOperationException(
                "Resend FromEmail is not configured."
            );
        }

        return fromEmail;
    }

    // ==================================================
    // VERIFICATION EMAIL
    // ==================================================

    private static string BuildVerificationEmail(
        string name,
        string otp)
    {
        var safeName =
            System.Net.WebUtility.HtmlEncode(name);

        return $"""
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0">

            <title>Learnify Verification</title>

        </head>

        <body style="
            margin: 0;
            padding: 0;
            background: #f5f7fb;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 500px;
                margin: 40px auto;
                background: #ffffff;
                padding: 40px;
                border-radius: 16px;
            ">

                <h1 style="
                    margin-top: 0;
                    text-align: center;
                ">
                    Learnify
                </h1>

                <p>
                    Hello {safeName},
                </p>

                <p>
                    Use the verification code below
                    to verify your Learnify account.
                </p>

                <div style="
                    margin: 30px 0;
                    text-align: center;
                ">

                    <span style="
                        display: inline-block;
                        padding: 16px 28px;
                        background: #f0f3f8;
                        border-radius: 12px;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                    ">
                        {otp}
                    </span>

                </div>

                <p>
                    This code will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p style="
                    color: #777777;
                    font-size: 13px;
                ">
                    If you did not create a Learnify
                    account, you can safely ignore
                    this email.
                </p>

            </div>

        </body>

        </html>
        """;
    }

    // ==================================================
    // PASSWORD RESET EMAIL
    // ==================================================

    private static string BuildPasswordResetEmail(
        string name,
        string otp)
    {
        var safeName =
            System.Net.WebUtility.HtmlEncode(name);

        return $"""
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0">

            <title>Learnify Password Reset</title>

        </head>

        <body style="
            margin: 0;
            padding: 0;
            background: #f5f7fb;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 500px;
                margin: 40px auto;
                background: #ffffff;
                padding: 40px;
                border-radius: 16px;
            ">

                <h1 style="
                    margin-top: 0;
                    text-align: center;
                ">
                    Learnify
                </h1>

                <p>
                    Hello {safeName},
                </p>

                <p>
                    We received a request to reset
                    your Learnify password.
                </p>

                <p>
                    Use the verification code below
                    to continue.
                </p>

                <div style="
                    margin: 30px 0;
                    text-align: center;
                ">

                    <span style="
                        display: inline-block;
                        padding: 16px 28px;
                        background: #f0f3f8;
                        border-radius: 12px;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                    ">
                        {otp}
                    </span>

                </div>

                <p>
                    This code will expire in
                    <strong>10 minutes</strong>.
                </p>

                <p style="
                    color: #777777;
                    font-size: 13px;
                ">
                    If you did not request a password
                    reset, you can safely ignore this email.
                </p>

            </div>

        </body>

        </html>
        """;
    }
}