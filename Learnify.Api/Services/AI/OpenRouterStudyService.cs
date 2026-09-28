using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Learnify.Api.DTOs.AI;
using Microsoft.Extensions.Options;

namespace Learnify.Api.Services.AI;

public class OpenRouterStudyService
    : IAIStudyService
{
    private readonly HttpClient _httpClient;
    private readonly AIServiceOptions _options;

    private static readonly JsonSerializerOptions
        JsonOptions =
            new()
            {
                PropertyNameCaseInsensitive = true
            };

    public OpenRouterStudyService(
        HttpClient httpClient,
        IOptions<AIServiceOptions> options)
    {
        _httpClient = httpClient;

        _options =
            options.Value;
    }

    // ==================================================
    // MAIN GENERATION METHOD
    // ==================================================

    public async Task<GenerateStudyResponse>
        GenerateStudyAssetsAsync(
            GenerateStudyRequest request)
    {
        if (request is null)
        {
            throw new ArgumentException(
                "Generation request is required.");
        }

        if (string.IsNullOrWhiteSpace(
            request.SubjectId))
        {
            throw new ArgumentException(
                "SubjectId is required.");
        }

        if (string.IsNullOrWhiteSpace(
            request.Content))
        {
            throw new ArgumentException(
                "Study content is required.");
        }

        if (string.IsNullOrWhiteSpace(
            _options.ApiKey))
        {
            throw new InvalidOperationException(
                "OpenRouter API key is missing.");
        }

        if (string.IsNullOrWhiteSpace(
            _options.Model))
        {
            throw new InvalidOperationException(
                "OpenRouter model is missing.");
        }

        // --------------------------------------------------
        // Build prompt
        // --------------------------------------------------

        var systemPrompt =
            """
            You are Learnify Pocket's study-material generator.

            Your task is to analyze the supplied study material
            and return ONLY one valid JSON object.

            Do not return:
            - Markdown
            - code fences
            - explanations outside the JSON
            - introductory text
            - concluding text

            The JSON object MUST use exactly this structure:

            {
              "summary": "A concise summary of the study material.",
              "noteTitle": "A suitable title for the generated note.",
              "noteContent": "A comprehensive set of study notes.",
              "flashcards": [
                {
                  "front": "Question or prompt.",
                  "back": "Answer."
                }
              ],
              "quiz": [
                {
                  "question": "Multiple-choice question.",
                  "options": [
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D"
                  ],
                  "correctAnswer": 0,
                  "explanation": "Why this answer is correct."
                }
              ],
              "practice": [
                {
                  "title": "Practice exercise title.",
                  "instruction": "Instructions for the exercise.",
                  "starterCode": "Optional starter code."
                }
              ]
            }

            Rules:

            1. Generate exactly 10 flashcards.
            2. Generate exactly 10 quiz questions.
            3. Every quiz question must have exactly 4 options.
            4. correctAnswer must be a zero-based integer from 0 to 3.
            5. Generate exactly 3 practice exercises.
            6. Base all generated content on the supplied study material.
            7. Do not invent unrelated topics.
            8. The response must be valid JSON.
            """;

        var userPrompt =
            BuildUserPrompt(request);

        var requestBody =
            new
            {
                model =
                    _options.Model,

                temperature =
                    0.3,

                response_format =
                    new
                    {
                        type = "json_object"
                    },

                messages =
                    new[]
                    {
                        new
                        {
                            role = "system",
                            content =
                                systemPrompt
                        },

                        new
                        {
                            role = "user",
                            content =
                                userPrompt
                        }
                    }
            };

        // --------------------------------------------------
        // Prepare HTTP request
        // --------------------------------------------------

        using var httpRequest =
            new HttpRequestMessage(
                HttpMethod.Post,
                "chat/completions");

        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                _options.ApiKey);

        httpRequest.Headers.TryAddWithoutValidation(
            "HTTP-Referer",
            "https://learnifypkt.vercel.app");

        httpRequest.Headers.TryAddWithoutValidation(
            "X-Title",
            "Learnify Pocket");

        httpRequest.Content =
            new StringContent(
                JsonSerializer.Serialize(
                    requestBody),
                Encoding.UTF8,
                "application/json");

        // --------------------------------------------------
        // Call OpenRouter
        // --------------------------------------------------

        using var response =
            await _httpClient.SendAsync(
                httpRequest);

        var responseBody =
            await response.Content
                .ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"OpenRouter returned {(int)response.StatusCode} " +
                $"{response.StatusCode}. " +
                $"Response: {Truncate(responseBody, 2000)}");
        }

        // --------------------------------------------------
        // Parse OpenRouter envelope
        // --------------------------------------------------

        OpenRouterResponse?
            openRouterResponse;

        try
        {
            openRouterResponse =
                JsonSerializer.Deserialize<
                    OpenRouterResponse>(
                    responseBody,
                    JsonOptions);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                "OpenRouter returned an invalid API response.",
                ex);
        }

        var content =
            openRouterResponse?
                .Choices?
                .FirstOrDefault()?
                .Message?
                .Content;

        if (string.IsNullOrWhiteSpace(
            content))
        {
            throw new InvalidOperationException(
                "OpenRouter returned no generated content.");
        }

        // --------------------------------------------------
        // Extract valid JSON from model content
        // --------------------------------------------------

        var cleanedJson =
            ExtractJsonObject(
                content);

        if (string.IsNullOrWhiteSpace(
            cleanedJson))
        {
            throw new InvalidOperationException(
                "The AI returned a response that was not valid JSON. " +
                $"AI response: {Truncate(content, 1000)}");
        }

        // --------------------------------------------------
        // Deserialize generated study response
        // --------------------------------------------------

        GenerateStudyResponse?
            result;

        try
        {
            result =
                JsonSerializer.Deserialize<
                    GenerateStudyResponse>(
                    cleanedJson,
                    JsonOptions);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                "The AI returned JSON, but it did not match " +
                "the expected study-material structure. " +
                $"AI response: {Truncate(cleanedJson, 2000)}",
                ex);
        }

        if (result is null)
        {
            throw new InvalidOperationException(
                "The AI generated an empty study response.");
        }

        // --------------------------------------------------
        // Validate generated structure
        // --------------------------------------------------

        ValidateGeneratedResponse(
            result);

        return result;
    }

    // ==================================================
    // USER PROMPT
    // ==================================================

    private static string BuildUserPrompt(
        GenerateStudyRequest request)
    {
        var instructions =
            string.IsNullOrWhiteSpace(
                request.Instructions)
                ? "No additional instructions."
                : request.Instructions.Trim();

        var builder =
            new StringBuilder();

        builder.AppendLine(
            "Generate study materials from the following document.");

        builder.AppendLine();

        builder.AppendLine(
            $"File name: {request.FileName}");

        builder.AppendLine();

        builder.AppendLine(
            "Additional instructions:");

        builder.AppendLine(
            instructions);

        builder.AppendLine();

        builder.AppendLine(
            "Study material:");

        builder.AppendLine(
            "------------------------------");

        builder.AppendLine(
            request.Content);

        builder.AppendLine(
            "------------------------------");

        return builder.ToString();
    }

    // ==================================================
    // JSON EXTRACTION
    // ==================================================

    private static string?
        ExtractJsonObject(
            string content)
    {
        if (string.IsNullOrWhiteSpace(
            content))
        {
            return null;
        }

        var cleaned =
            content.Trim();

        // ------------------------------------------
        // Remove Markdown code fences
        // ------------------------------------------

        if (cleaned.StartsWith(
                "```",
                StringComparison.Ordinal))
        {
            cleaned =
                cleaned
                    .Replace(
                        "```json",
                        "",
                        StringComparison.OrdinalIgnoreCase)
                    .Replace(
                        "```",
                        "")
                    .Trim();
        }

        // ------------------------------------------
        // Direct JSON
        // ------------------------------------------

        if (cleaned.StartsWith("{") &&
            cleaned.EndsWith("}"))
        {
            return cleaned;
        }

        // ------------------------------------------
        // Try to locate JSON object
        // inside surrounding text
        // ------------------------------------------

        var firstBrace =
            cleaned.IndexOf('{');

        var lastBrace =
            cleaned.LastIndexOf('}');

        if (
            firstBrace >= 0 &&
            lastBrace > firstBrace)
        {
            var candidate =
                cleaned.Substring(
                    firstBrace,
                    lastBrace -
                        firstBrace +
                        1);

            try
            {
                using var document =
                    JsonDocument.Parse(
                        candidate);

                if (
                    document.RootElement
                        .ValueKind ==
                    JsonValueKind.Object)
                {
                    return candidate;
                }
            }
            catch (JsonException)
            {
                return null;
            }
        }

        return null;
    }

    // ==================================================
    // GENERATED RESPONSE VALIDATION
    // ==================================================

    private static void ValidateGeneratedResponse(
        GenerateStudyResponse result)
    {
        if (string.IsNullOrWhiteSpace(
            result.Summary))
        {
            throw new InvalidOperationException(
                "The AI response is missing a summary.");
        }

        if (string.IsNullOrWhiteSpace(
            result.NoteTitle))
        {
            throw new InvalidOperationException(
                "The AI response is missing a note title.");
        }

        if (string.IsNullOrWhiteSpace(
            result.NoteContent))
        {
            throw new InvalidOperationException(
                "The AI response is missing note content.");
        }

        if (
            result.Flashcards is null ||
            result.Flashcards.Count == 0)
        {
            throw new InvalidOperationException(
                "The AI did not generate any flashcards.");
        }

        if (
            result.Quiz is null ||
            result.Quiz.Count == 0)
        {
            throw new InvalidOperationException(
                "The AI did not generate any quiz questions.");
        }

        if (
            result.Practice is null ||
            result.Practice.Count == 0)
        {
            throw new InvalidOperationException(
                "The AI did not generate any practice exercises.");
        }

        // ------------------------------------------
        // Validate flashcards
        // ------------------------------------------

        foreach (
            var flashcard
            in result.Flashcards)
        {
            if (string.IsNullOrWhiteSpace(
                flashcard.Front))
            {
                throw new InvalidOperationException(
                    "A generated flashcard is missing its front.");
            }

            if (string.IsNullOrWhiteSpace(
                flashcard.Back))
            {
                throw new InvalidOperationException(
                    "A generated flashcard is missing its back.");
            }
        }

        // ------------------------------------------
        // Validate quiz
        // ------------------------------------------

        foreach (
            var question
            in result.Quiz)
        {
            if (string.IsNullOrWhiteSpace(
                question.Question))
            {
                throw new InvalidOperationException(
                    "A generated quiz question is empty.");
            }

            if (
                question.Options is null ||
                question.Options.Count != 4)
            {
                throw new InvalidOperationException(
                    "Every generated quiz question must have exactly 4 options.");
            }

            if (
                question.CorrectAnswer < 0 ||
                question.CorrectAnswer > 3)
            {
                throw new InvalidOperationException(
                    "A generated quiz question contains an invalid correctAnswer.");
            }

            if (
                question.Options.Any(
                    string.IsNullOrWhiteSpace))
            {
                throw new InvalidOperationException(
                    "A generated quiz question contains an empty option.");
            }
        }

        // ------------------------------------------
        // Validate practice
        // ------------------------------------------

        foreach (
            var exercise
            in result.Practice)
        {
            if (string.IsNullOrWhiteSpace(
                exercise.Title))
            {
                throw new InvalidOperationException(
                    "A generated practice exercise is missing its title.");
            }

            if (string.IsNullOrWhiteSpace(
                exercise.Instruction))
            {
                throw new InvalidOperationException(
                    "A generated practice exercise is missing its instruction.");
            }
        }
    }

    // ==================================================
    // HELPERS
    // ==================================================

    private static string Truncate(
        string value,
        int maxLength)
    {
        if (string.IsNullOrEmpty(
            value))
        {
            return string.Empty;
        }

        if (value.Length <= maxLength)
        {
            return value;
        }

        return value.Substring(
                   0,
                   maxLength)
               + "...";
    }

    // ==================================================
    // OPENROUTER RESPONSE MODELS
    // ==================================================

    private sealed class OpenRouterResponse
    {
        [JsonPropertyName("choices")]
        public List<OpenRouterChoice>?
            Choices
        { get; set; }
    }

    private sealed class OpenRouterChoice
    {
        [JsonPropertyName("message")]
        public OpenRouterMessage?
            Message
        { get; set; }
    }

    private sealed class OpenRouterMessage
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
