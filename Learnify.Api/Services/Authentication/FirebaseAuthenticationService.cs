using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using Learnify.Api.DTOs.Authentication;

namespace Learnify.Api.Services.Authentication;

public class FirebaseAuthenticationService
    : IAuthenticationService
{
    private readonly FirestoreDb _firestore;

    private readonly IConfiguration _configuration;

    private readonly HttpClient _httpClient;

    private readonly IEmailOtpService _emailOtpService;

    public FirebaseAuthenticationService(
        FirestoreDb firestore,
        IConfiguration configuration,
        HttpClient httpClient,
        IEmailOtpService emailOtpService)
    {
        _firestore = firestore;
        _configuration = configuration;
        _httpClient = httpClient;
        _emailOtpService = emailOtpService;
    }

    // ==================================================
    // REGISTER
    // ==================================================

    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request)
    {
        try
        {
            var userArgs =
                new UserRecordArgs
                {
                    Email = request.Email,
                    Password = request.Password,
                    DisplayName = request.Name
                };

            var userRecord =
                await FirebaseAuth.DefaultInstance
                    .CreateUserAsync(userArgs);

            var userData =
                new Dictionary<string, object>
                {
                    {
                        "uid",
                        userRecord.Uid
                    },
                    {
                        "name",
                        request.Name
                    },
                    {
                        "email",
                        request.Email
                    },
                    {
                        "emailVerified",
                        false
                    },
                    {
                        "createdAt",
                        Timestamp.GetCurrentTimestamp()
                    }
                };

            var userDocument =
                _firestore
                    .Collection("users")
                    .Document(userRecord.Uid);

            await userDocument.SetAsync(userData);

            await _emailOtpService
                .SendVerificationOtpAsync(
                    userRecord.Uid,
                    userRecord.Email,
                    userRecord.DisplayName
                );

            return new AuthResponse
            {
                Success = true,

                Message =
                    "Registration successful. " +
                    "A verification code has been sent " +
                    "to your email.",

                Uid = userRecord.Uid,

                Email = userRecord.Email,

                Name = userRecord.DisplayName
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // LOGIN
    // ==================================================

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request)
    {
        try
        {
            var apiKey =
                _configuration[
                    "Firebase:WebApiKey"
                ];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "Firebase Web API key is not configured."
                );
            }

            var url =
                "https://identitytoolkit.googleapis.com" +
                "/v1/accounts:signInWithPassword" +
                $"?key={apiKey}";

            var firebaseRequest =
                new FirebaseLoginRequest
                {
                    Email = request.Email,

                    Password = request.Password,

                    ReturnSecureToken = true
                };

            var response =
                await _httpClient.PostAsJsonAsync(
                    url,
                    firebaseRequest
                );

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content
                        .ReadFromJsonAsync<
                            FirebaseErrorResponse
                        >();

                return new AuthResponse
                {
                    Success = false,

                    Message =
                        error?.Error?.Message ??
                        "Login failed."
                };
            }

            var firebaseResponse =
                await response.Content
                    .ReadFromJsonAsync<
                        FirebaseLoginResponse
                    >();

            if (firebaseResponse == null)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid response from Firebase."
                };
            }

            var userRecord =
                await FirebaseAuth.DefaultInstance
                    .GetUserAsync(
                        firebaseResponse.LocalId
                    );

            return new AuthResponse
            {
                Success = true,

                Message =
                    "Login successful.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName,

                IdToken =
                    firebaseResponse.IdToken
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // GET CURRENT USER
    // ==================================================

    public async Task<AuthResponse> GetCurrentUserAsync(
        string uid)
    {
        try
        {
            var userRecord =
                await FirebaseAuth.DefaultInstance
                    .GetUserAsync(uid);

            return new AuthResponse
            {
                Success = true,

                Message =
                    "User retrieved successfully.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // VERIFY EMAIL OTP
    // ==================================================

    public async Task<AuthResponse> VerifyEmailOtpAsync(
        string uid,
        string otp)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(uid))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "User ID is required."
                };
            }

            if (string.IsNullOrWhiteSpace(otp))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Verification code is required."
                };
            }

            var valid =
                await _emailOtpService
                    .VerifyOtpAsync(
                        uid,
                        otp
                    );

            if (!valid)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired verification code."
                };
            }

            await FirebaseAuth.DefaultInstance
                .UpdateUserAsync(
                    new UserRecordArgs
                    {
                        Uid = uid,

                        EmailVerified = true
                    }
                );

            await _firestore
                .Collection("users")
                .Document(uid)
                .UpdateAsync(
                    "emailVerified",
                    true
                );

            var userRecord =
                await FirebaseAuth.DefaultInstance
                    .GetUserAsync(uid);

            return new AuthResponse
            {
                Success = true,

                Message =
                    "Email verified successfully.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // SEND / RESEND VERIFICATION OTP
    // ==================================================

    public async Task<AuthResponse>
        SendEmailVerificationAsync(string uid)
    {
        try
        {
            var userRecord =
                await FirebaseAuth.DefaultInstance
                    .GetUserAsync(uid);

            if (userRecord.EmailVerified)
            {
                return new AuthResponse
                {
                    Success = true,

                    Message =
                        "Email is already verified.",

                    Uid =
                        userRecord.Uid,

                    Email =
                        userRecord.Email,

                    Name =
                        userRecord.DisplayName
                };
            }

            await _emailOtpService
                .SendVerificationOtpAsync(
                    userRecord.Uid,
                    userRecord.Email,
                    userRecord.DisplayName
                );

            return new AuthResponse
            {
                Success = true,

                Message =
                    "A new verification code has been sent.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // SEND PASSWORD RESET OTP
    // ==================================================

    public async Task<AuthResponse>
        SendPasswordResetOtpAsync(
            ForgotPasswordRequest request)
    {
        try
        {
            var email =
                request.Email.Trim();

            if (string.IsNullOrWhiteSpace(email))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Email address is required."
                };
            }

            UserRecord userRecord;

            try
            {
                userRecord =
                    await FirebaseAuth.DefaultInstance
                        .GetUserByEmailAsync(email);
            }
            catch (FirebaseAuthException)
            {
                return new AuthResponse
                {
                    Success = true,

                    Message =
                        "If an account exists for this " +
                        "email, a password reset code " +
                        "has been sent."
                };
            }

            await _emailOtpService
                .SendPasswordResetOtpAsync(
                    userRecord.Uid,
                    userRecord.Email,
                    userRecord.DisplayName
                );

            return new AuthResponse
            {
                Success = true,

                Message =
                    "If an account exists for this " +
                    "email, a password reset code " +
                    "has been sent."
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // VERIFY PASSWORD RESET OTP
    // ==================================================

    public async Task<AuthResponse>
        VerifyPasswordResetOtpAsync(
            VerifyPasswordResetRequest request)
    {
        try
        {
            var email =
                request.Email.Trim();

            var otp =
                request.Otp.Trim();

            if (string.IsNullOrWhiteSpace(email))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Email address is required."
                };
            }

            if (string.IsNullOrWhiteSpace(otp))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Verification code is required."
                };
            }

            UserRecord userRecord;

            try
            {
                userRecord =
                    await FirebaseAuth.DefaultInstance
                        .GetUserByEmailAsync(email);
            }
            catch (FirebaseAuthException)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired verification code."
                };
            }

            var valid =
                await _emailOtpService
                    .VerifyPasswordResetOtpAsync(
                        userRecord.Uid,
                        otp
                    );

            if (!valid)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired verification code."
                };
            }

            // ------------------------------------------
            // Generate reset token
            // ------------------------------------------

            var resetToken =
                GenerateResetToken();

            var resetTokenHash =
                HashResetToken(resetToken);

            var expiresAt =
                DateTime.UtcNow.AddMinutes(10);

            var resetTokenData =
                new Dictionary<string, object>
                {
                    {
                        "uid",
                        userRecord.Uid
                    },
                    {
                        "email",
                        userRecord.Email
                    },
                    {
                        "tokenHash",
                        resetTokenHash
                    },
                    {
                        "expiresAt",
                        Timestamp.FromDateTime(
                            expiresAt
                        )
                    },
                    {
                        "createdAt",
                        Timestamp.GetCurrentTimestamp()
                    }
                };

            await _firestore
                .Collection("passwordResetTokens")
                .Document(userRecord.Uid)
                .SetAsync(resetTokenData);

            return new AuthResponse
            {
                Success = true,

                Message =
                    "Verification code accepted.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName,

                ResetToken =
                    resetToken
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // RESET PASSWORD
    // ==================================================

    public async Task<AuthResponse>
        ResetPasswordAsync(
            ResetPasswordRequest request)
    {
        try
        {
            var email =
                request.Email.Trim();

            var resetToken =
                request.ResetToken.Trim();

            var newPassword =
                request.NewPassword;

            if (string.IsNullOrWhiteSpace(email))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Email address is required."
                };
            }

            if (string.IsNullOrWhiteSpace(resetToken))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Reset token is required."
                };
            }

            if (string.IsNullOrWhiteSpace(newPassword))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "New password is required."
                };
            }

            if (newPassword.Length < 6)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Password must be at least 6 characters."
                };
            }

            // ------------------------------------------
            // Find Firebase user
            // ------------------------------------------

            UserRecord userRecord;

            try
            {
                userRecord =
                    await FirebaseAuth.DefaultInstance
                        .GetUserByEmailAsync(email);
            }
            catch (FirebaseAuthException)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            // ------------------------------------------
            // Find reset token
            // ------------------------------------------

            var tokenDocument =
                _firestore
                    .Collection("passwordResetTokens")
                    .Document(userRecord.Uid);

            var tokenSnapshot =
                await tokenDocument
                    .GetSnapshotAsync();

            if (!tokenSnapshot.Exists)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            var tokenData =
                tokenSnapshot.ToDictionary();

            // ------------------------------------------
            // Token hash
            // ------------------------------------------

            if (!tokenData.TryGetValue(
                    "tokenHash",
                    out var storedHashObject))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            var storedHash =
                storedHashObject?.ToString();

            if (string.IsNullOrWhiteSpace(storedHash))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            var suppliedHash =
                HashResetToken(resetToken);

            var hashesMatch =
                CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(
                        storedHash
                    ),
                    Encoding.UTF8.GetBytes(
                        suppliedHash
                    )
                );

            if (!hashesMatch)
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            // ------------------------------------------
            // Token expiration
            // ------------------------------------------

            if (!tokenData.TryGetValue(
                    "expiresAt",
                    out var expiresObject))
            {
                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            var expiresAt =
                ((Timestamp)expiresObject)
                .ToDateTime();

            if (DateTime.UtcNow > expiresAt)
            {
                await tokenDocument.DeleteAsync();

                return new AuthResponse
                {
                    Success = false,

                    Message =
                        "Invalid or expired reset token."
                };
            }

            // ------------------------------------------
            // Change Firebase password
            // ------------------------------------------

            await FirebaseAuth.DefaultInstance
                .UpdateUserAsync(
                    new UserRecordArgs
                    {
                        Uid =
                            userRecord.Uid,

                        Password =
                            newPassword
                    }
                );

            // ------------------------------------------
            // Consume reset token
            // ------------------------------------------

            await tokenDocument.DeleteAsync();

            // ------------------------------------------
            // Consume password reset OTP
            // ------------------------------------------

            await _emailOtpService
                .DeletePasswordResetOtpAsync(
                    userRecord.Uid
                );

            return new AuthResponse
            {
                Success = true,

                Message =
                    "Password reset successfully.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // LOGIN WITH GOOGLE
    // ==================================================

    public async Task<AuthResponse> LoginWithGoogleAsync(
        string idToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Google ID token is required."
                };
            }

            var decodedToken =
                await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(idToken);

            var uid = decodedToken.Uid;

            var userRecord =
                await FirebaseAuth.DefaultInstance
                    .GetUserAsync(uid);

            var userDocument =
                _firestore
                    .Collection("users")
                    .Document(uid);

            var userSnapshot =
                await userDocument.GetSnapshotAsync();

            if (!userSnapshot.Exists)
            {
                var userData =
                    new Dictionary<string, object>
                    {
                        {
                            "uid",
                            userRecord.Uid
                        },
                        {
                            "name",
                            userRecord.DisplayName ?? string.Empty
                        },
                        {
                            "email",
                            userRecord.Email ?? string.Empty
                        },
                        {
                            "emailVerified",
                            userRecord.EmailVerified
                        },
                        {
                            "createdAt",
                            Timestamp.GetCurrentTimestamp()
                        }
                    };

                await userDocument.SetAsync(userData);
            }

            return new AuthResponse
            {
                Success = true,

                Message =
                    "Google login successful.",

                Uid =
                    userRecord.Uid,

                Email =
                    userRecord.Email,

                Name =
                    userRecord.DisplayName,

                IdToken =
                    idToken
            };
        }
        catch (FirebaseAuthException ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
        catch (Exception ex)
        {
            return new AuthResponse
            {
                Success = false,
                Message = ex.Message
            };
        }
    }

    // ==================================================
    // GENERATE RESET TOKEN
    // ==================================================

    private static string GenerateResetToken()
    {
        var bytes =
            RandomNumberGenerator.GetBytes(32);

        return Convert.ToBase64String(bytes);
    }

    // ==================================================
    // HASH RESET TOKEN
    // ==================================================

    private static string HashResetToken(
        string token)
    {
        using var sha256 =
            SHA256.Create();

        var bytes =
            Encoding.UTF8.GetBytes(token);

        var hash =
            sha256.ComputeHash(bytes);

        return Convert.ToHexString(hash);
    }

    // ==================================================
    // FIREBASE REQUEST MODELS
    // ==================================================

    private class FirebaseLoginRequest
    {
        [JsonPropertyName("email")]
        public string Email { get; set; } =
            string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; set; } =
            string.Empty;

        [JsonPropertyName("returnSecureToken")]
        public bool ReturnSecureToken { get; set; }
    }

    private class FirebaseLoginResponse
    {
        [JsonPropertyName("localId")]
        public string LocalId { get; set; } =
            string.Empty;

        [JsonPropertyName("idToken")]
        public string IdToken { get; set; } =
            string.Empty;

        [JsonPropertyName("refreshToken")]
        public string RefreshToken { get; set; } =
            string.Empty;

        [JsonPropertyName("expiresIn")]
        public string ExpiresIn { get; set; } =
            string.Empty;
    }

    private class FirebaseErrorResponse
    {
        [JsonPropertyName("error")]
        public FirebaseError? Error { get; set; }
    }

    private class FirebaseError
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } =
            string.Empty;
    }
}