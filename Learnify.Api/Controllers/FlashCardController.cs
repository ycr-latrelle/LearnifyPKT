using System.Security.Claims;
using Learnify.Api.DTOs.Study;
using Learnify.Api.Services.Study;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/subjects/{subjectId}/flashcards")]
public class FlashcardsController : ControllerBase
{
    private readonly IFlashcardService _flashcardService;

    public FlashcardsController(
        IFlashcardService flashcardService)
    {
        _flashcardService =
            flashcardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetFlashcards(
        string subjectId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var flashcards =
            await _flashcardService
                .GetFlashcardsAsync(
                    uid,
                    subjectId);

        return Ok(flashcards);
    }

    [HttpGet("{flashcardId}")]
    public async Task<IActionResult> GetFlashcard(
        string subjectId,
        string flashcardId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var flashcard =
            await _flashcardService
                .GetFlashcardAsync(
                    uid,
                    subjectId,
                    flashcardId);

        if (flashcard is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Flashcard not found."
                });
        }

        return Ok(flashcard);
    }

    [HttpPost]
    public async Task<IActionResult> CreateFlashcard(
        string subjectId,
        [FromBody] CreateFlashcardRequest request)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        try
        {
            var flashcard =
                await _flashcardService
                    .CreateFlashcardAsync(
                        uid,
                        subjectId,
                        request);

            if (flashcard is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Subject not found."
                    });
            }

            return CreatedAtAction(
                nameof(GetFlashcard),
                new
                {
                    subjectId,
                    flashcardId =
                        flashcard.Id
                },
                flashcard);
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
    }

    [HttpPut("{flashcardId}")]
    public async Task<IActionResult> UpdateFlashcard(
        string subjectId,
        string flashcardId,
        [FromBody] UpdateFlashcardRequest request)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        try
        {
            var flashcard =
                await _flashcardService
                    .UpdateFlashcardAsync(
                        uid,
                        subjectId,
                        flashcardId,
                        request);

            if (flashcard is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Flashcard not found."
                    });
            }

            return Ok(flashcard);
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
    }

    [HttpDelete("{flashcardId}")]
    public async Task<IActionResult> DeleteFlashcard(
        string subjectId,
        string flashcardId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var deleted =
            await _flashcardService
                .DeleteFlashcardAsync(
                    uid,
                    subjectId,
                    flashcardId);

        if (!deleted)
        {
            return NotFound(
                new
                {
                    message =
                        "Flashcard not found."
                });
        }

        return NoContent();
    }

    private string? GetUid()
    {
        return User.FindFirstValue(
            ClaimTypes.NameIdentifier);
    }
}