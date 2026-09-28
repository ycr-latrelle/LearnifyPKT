using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Learnify.Api.Services.Authentication;
using Learnify.Api.Services.Study;
using Learnify.Api.Services.AI;
using Microsoft.Extensions.Options;
using Resend;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// AI / OpenRouter
// ========================================

builder.Services.Configure<AIServiceOptions>(
    builder.Configuration.GetSection("AI"));

builder.Services.AddHttpClient<
    IAIStudyService,
    OpenRouterStudyService>(
    (serviceProvider, client) =>
    {
        var options =
            serviceProvider
                .GetRequiredService<
                    IOptions<AIServiceOptions>>()
                .Value;

        client.BaseAddress =
            new Uri(options.BaseUrl);

        client.Timeout =
            TimeSpan.FromMinutes(5);
    });

// ========================================
// CORS
// ========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "LearnifyFrontend",
        policy =>
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
    builder.Configuration[
        "FIREBASE_SERVICE_ACCOUNT"];

var serviceAccountCredential =
    !string.IsNullOrWhiteSpace(
        firebaseServiceAccount)
        ? CredentialFactory
            .FromJson<ServiceAccountCredential>(
                firebaseServiceAccount)
        : CredentialFactory
            .FromFile<ServiceAccountCredential>(
                Path.Combine(
                    builder.Environment.ContentRootPath,
                    "secrets",
                    "service-account.json"
                )
            );

var firebaseCredential =
    serviceAccountCredential
        .ToGoogleCredential();

FirebaseApp.Create(
    new AppOptions
    {
        Credential =
            firebaseCredential
    });

// ========================================
// Firestore
// ========================================

var firestoreDb =
    new FirestoreDbBuilder
    {
        ProjectId =
            "learnifypkt",

        Credential =
            firebaseCredential
    }.Build();

builder.Services.AddSingleton(
    firestoreDb);

// ========================================
// Controllers
// ========================================

builder.Services.AddControllers();

builder.Services.AddHttpClient();

// ========================================
// Resend
// ========================================

builder.Services
    .AddOptions<ResendClientOptions>()
    .Configure(options =>
    {
        options.ApiToken =
            builder.Configuration[
                "Resend:ApiKey"
            ]
            ?? throw new InvalidOperationException(
                "Resend API key is missing."
            );
    });

builder.Services.AddTransient<
    IResend,
    ResendClient>();

// ========================================
// Authentication Services
// ========================================

builder.Services.AddScoped<
    Learnify.Api.Services.Authentication
        .IAuthenticationService,
    FirebaseAuthenticationService
>();

builder.Services.AddScoped<
    IEmailOtpService,
    EmailOtpService
>();

// ========================================
// Firebase Authentication
// ========================================

builder.Services
    .AddAuthentication("Firebase")
    .AddScheme<
        Microsoft.AspNetCore.Authentication
            .AuthenticationSchemeOptions,
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

builder.Services.AddScoped<
    IFlashcardService,
    FlashcardService
>();

// ========================================
// Quiz Service
// ========================================

builder.Services.AddScoped<
    IQuizService,
    QuizService
>();

// ========================================
// Study File Extraction
// ========================================

builder.Services.AddScoped<
    IStudyFileExtractionService,
    StudyFileExtractionService
>();

// ========================================
// Build Application
// ========================================

var app = builder.Build();

// ========================================
// Middleware
// ========================================

// Local development currently uses HTTP:
// http://localhost:5166
//
// HTTPS redirection is intentionally disabled
// to avoid the "Failed to determine the https port"
// warning when no HTTPS endpoint is configured.
//
// app.UseHttpsRedirection();

app.UseCors(
    "LearnifyFrontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();