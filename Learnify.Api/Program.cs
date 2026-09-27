using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Learnify.Api.Services.Authentication;
using Resend;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("LearnifyFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var firebaseCredentialsPath = Path.Combine(
    builder.Environment.ContentRootPath,
    "secrets",
    "service-account.json"
);

if (!File.Exists(firebaseCredentialsPath))
{
    throw new FileNotFoundException(
        "Firebase service account file was not found.",
        firebaseCredentialsPath
    );
}

var firebaseCredential = CredentialFactory
    .FromFile<ServiceAccountCredential>(
        firebaseCredentialsPath
    )
    .ToGoogleCredential();

FirebaseApp.Create(new AppOptions
{
    Credential = firebaseCredential
});

// Firestore
var firestoreDb = new FirestoreDbBuilder
{
    ProjectId = "learnifypkt",
    Credential = firebaseCredential
}.Build();

builder.Services.AddSingleton(firestoreDb);

builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddOptions<ResendClientOptions>()
    .Configure(options =>
    {
        options.ApiToken =
            builder.Configuration["Resend:ApiKey"]
            ?? throw new InvalidOperationException(
                "Resend API key is missing."
            );
    });

builder.Services.AddTransient<IResend, ResendClient>();

builder.Services.AddScoped<
    Learnify.Api.Services.Authentication.IAuthenticationService,
    FirebaseAuthenticationService
>();

builder.Services.AddScoped<IEmailOtpService, EmailOtpService>();

builder.Services.AddAuthentication("Firebase")
    .AddScheme<
        Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions,
        FirebaseAuthenticationHandler
    >(
        "Firebase",
        options => { }
    );

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("LearnifyFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();