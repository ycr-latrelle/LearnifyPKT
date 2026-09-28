using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Learnify.Api.Services.Authentication;
using Resend;
using Learnify.Api.Services.Study;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// CORS
// ========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("LearnifyFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://learnifypkt.netlify.app",
                "https://learnify-pkt.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ========================================
// Firebase
// ========================================

var firebaseServiceAccount =
    builder.Configuration["FIREBASE_SERVICE_ACCOUNT"];

var serviceAccountCredential =
    !string.IsNullOrWhiteSpace(firebaseServiceAccount)
        ? CredentialFactory
            .FromJson<ServiceAccountCredential>(
                firebaseServiceAccount
            )
        : CredentialFactory
            .FromFile<ServiceAccountCredential>(
                Path.Combine(
                    builder.Environment.ContentRootPath,
                    "secrets",
                    "service-account.json"
                )
            );

var firebaseCredential =
    serviceAccountCredential.ToGoogleCredential();

FirebaseApp.Create(new AppOptions
{
    Credential = firebaseCredential
});

// ========================================
// Firestore
// ========================================

var firestoreDb = new FirestoreDbBuilder
{
    ProjectId = "learnifypkt",
    Credential = firebaseCredential
}.Build();

builder.Services.AddSingleton(firestoreDb);

// ========================================
// Services
// ========================================

builder.Services.AddControllers();
builder.Services.AddHttpClient();

// ========================================
// Resend
// ========================================

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

// ========================================
// Authentication Services
// ========================================

builder.Services.AddScoped<
    Learnify.Api.Services.Authentication.IAuthenticationService,
    FirebaseAuthenticationService
>();

builder.Services.AddScoped<IEmailOtpService, EmailOtpService>();

// ========================================
// Firebase Authentication
// ========================================

builder.Services.AddAuthentication("Firebase")
    .AddScheme<
        Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions,
        FirebaseAuthenticationHandler
    >(
        "Firebase",
        options => { }
    );

builder.Services.AddAuthorization();

// ========================================
// Study Services
// ========================================

builder.Services.AddScoped<
    ISubjectService,
    SubjectService
>();

builder.Services.AddScoped<
    INoteService,
    NoteService
>();

// ========================================
// Build Application
// ========================================

var app = builder.Build();

// ========================================
// Middleware
// ========================================

app.UseHttpsRedirection();

app.UseCors("LearnifyFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();