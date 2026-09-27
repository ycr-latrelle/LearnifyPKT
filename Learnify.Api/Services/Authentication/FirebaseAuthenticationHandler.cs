using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Learnify.Api.Services.Authentication;

public class FirebaseAuthenticationHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override async Task<
        AuthenticateResult
    > HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(
                "Authorization",
                out var authorizationHeader))
        {
            return AuthenticateResult.NoResult();
        }

        var authorization =
            authorizationHeader.ToString();

        if (!authorization.StartsWith(
                "Bearer ",
                StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.Fail(
                "Authorization header must use Bearer authentication."
            );
        }

        var idToken =
            authorization[
                "Bearer ".Length..
            ].Trim();

        if (string.IsNullOrWhiteSpace(idToken))
        {
            return AuthenticateResult.Fail(
                "Firebase ID token is missing."
            );
        }

        try
        {
            var decodedToken =
                await FirebaseAuth.DefaultInstance
                    .VerifyIdTokenAsync(idToken);

            var claims =
                new List<Claim>
                {
                    new Claim(
                        ClaimTypes.NameIdentifier,
                        decodedToken.Uid
                    )
                };

            if (decodedToken.Claims.TryGetValue(
                    "email",
                    out var email))
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Email,
                        email?.ToString()
                        ?? string.Empty
                    )
                );
            }

            if (decodedToken.Claims.TryGetValue(
                    "name",
                    out var name))
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Name,
                        name?.ToString()
                        ?? string.Empty
                    )
                );
            }

            var identity =
                new ClaimsIdentity(
                    claims,
                    Scheme.Name
                );

            var principal =
                new ClaimsPrincipal(identity);

            var ticket =
                new AuthenticationTicket(
                    principal,
                    Scheme.Name
                );

            return AuthenticateResult.Success(
                ticket
            );
        }
        catch (FirebaseAuthException ex)
        {
            Logger.LogWarning(
                ex,
                "Firebase ID token validation failed."
            );

            return AuthenticateResult.Fail(
                "Invalid or expired Firebase ID token."
            );
        }
        catch (Exception ex)
        {
            Logger.LogError(
                ex,
                "Unexpected error while validating Firebase ID token."
            );

            return AuthenticateResult.Fail(
                "Authentication failed."
            );
        }
    }
}