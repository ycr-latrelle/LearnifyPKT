using Learnify.Api.DTOs.AI;
using Learnify.Api.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/study")]
public class StudyFileGenerationController : ControllerBase
{
    private readonly IAIStudyService _aiStudyService;

    private readonly IStudyFileExtractionService
        _fileExtractionService;

    public StudyFileGenerationController(
        IAIStudyService aiStudyService,
        IStudyFileExtractionService fileExtractionService)
    {
        _aiStudyService = aiStudyService;

        _fileExtractionService =
            fileExtractionService;
    }

    // ==================================================
    // GENERATE FROM FILE
    // ==================================================

    [HttpPost("generate-from-file")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> GenerateFromFile(
        [FromForm] GenerateStudyFileRequest request)
    {
        if (request.File is null)
        {
            return BadRequest(
                new
                {
                    message =
                        "A file is required."
                });
        }

        if (string.IsNullOrWhiteSpace(
            request.SubjectId))
        {
            return BadRequest(
                new
                {
                    message =
                        "A subject is required."
                });
        }

        try
        {
            // ------------------------------------------
            // Extract text temporarily
            // ------------------------------------------

            var content =
                await _fileExtractionService
                    .ExtractTextAsync(
                        request.File);

            // ------------------------------------------
            // Create AI request
            // ------------------------------------------

            var aiRequest =
                new GenerateStudyRequest
                {
                    SubjectId =
                        request.SubjectId,

                    FileName =
                        Path.GetFileName(
                            request.File.FileName),

                    Content =
                        content,

                    Instructions =
                        request.Instructions
                };

            // ------------------------------------------
            // Generate study materials
            // ------------------------------------------

            var result =
                await _aiStudyService
                    .GenerateStudyAssetsAsync(
                        aiRequest);

            // ------------------------------------------
            // Attach source metadata
            //
            // The original file and extracted
            // content are NOT returned or stored.
            // ------------------------------------------

            result.SourceFileName =
                Path.GetFileName(
                    request.File.FileName);

            result.SourceType =
                Path.GetExtension(
                    request.File.FileName)
                    .TrimStart('.')
                    .ToLowerInvariant();

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(
                new
                {
                    message =
                        ex.Message
                });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(
                StatusCodes.Status502BadGateway,
                new
                {
                    message =
                        "AI generation failed.",

                    error =
                        ex.Message
                });
        }
    }
}