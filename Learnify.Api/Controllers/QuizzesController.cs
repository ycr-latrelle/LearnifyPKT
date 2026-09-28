using System.Security.Claims;
using Learnify.Api.DTOs.Study;
using Learnify.Api.Services.Study;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/subjects/{subjectId}/quizzes")]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizzesController(
        IQuizService quizService)
    {
        _quizService = quizService;
    }

    // ==================================================
    // GET ALL
    // ==================================================

    [HttpGet]
    public async Task<IActionResult> GetQuizzes(
        string subjectId)
    {
        var ownerUid =
            GetOwnerUid();

        var quizzes =
            await _quizService
                .GetQuizzesAsync(
                    ownerUid,
                    subjectId);

        return Ok(quizzes);
    }

    // ==================================================
    // GET SINGLE
    // ==================================================

    [HttpGet("{quizId}")]
    public async Task<IActionResult> GetQuiz(
        string subjectId,
        string quizId)
    {
        var ownerUid =
            GetOwnerUid();

        var quiz =
            await _quizService
                .GetQuizAsync(
                    ownerUid,
                    subjectId,
                    quizId);

        if (quiz is null)
        {
            return NotFound(
                new
                {
                    message = "Quiz not found."
                });
        }

        return Ok(quiz);
    }

    // ==================================================
    // CREATE
    // ==================================================

    [HttpPost]
    public async Task<IActionResult> CreateQuiz(
        string subjectId,
        [FromBody] CreateQuizRequest request)
    {
        var ownerUid =
            GetOwnerUid();

        try
        {
            var quiz =
                await _quizService
                    .CreateQuizAsync(
                        ownerUid,
                        subjectId,
                        request);

            return CreatedAtAction(
                nameof(GetQuiz),
                new
                {
                    subjectId,
                    quizId = quiz!.Id
                },
                quiz);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    // ==================================================
    // UPDATE
    // ==================================================

    [HttpPut("{quizId}")]
    public async Task<IActionResult> UpdateQuiz(
        string subjectId,
        string quizId,
        [FromBody] UpdateQuizRequest request)
    {
        var ownerUid =
            GetOwnerUid();

        try
        {
            var quiz =
                await _quizService
                    .UpdateQuizAsync(
                        ownerUid,
                        subjectId,
                        quizId,
                        request);

            if (quiz is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Quiz not found."
                    });
            }

            return Ok(quiz);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    // ==================================================
    // DELETE
    // ==================================================

    [HttpDelete("{quizId}")]
    public async Task<IActionResult> DeleteQuiz(
        string subjectId,
        string quizId)
    {
        var ownerUid =
            GetOwnerUid();

        var deleted =
            await _quizService
                .DeleteQuizAsync(
                    ownerUid,
                    subjectId,
                    quizId);

        if (!deleted)
        {
            return NotFound(
                new
                {
                    message =
                        "Quiz not found."
                });
        }

        return NoContent();
    }

    // ==================================================
    // FIREBASE UID
    // ==================================================

    private string GetOwnerUid()
    {
        var uid =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(uid))
        {
            throw new UnauthorizedAccessException(
                "Firebase user ID is missing.");
        }

        return uid;
    }
}