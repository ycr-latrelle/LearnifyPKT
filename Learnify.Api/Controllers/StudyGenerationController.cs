using Learnify.Api.DTOs.AI;
using Learnify.Api.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/study")]
public class StudyGenerationController : ControllerBase
{
    private readonly IAIStudyService _aiStudyService;

    public StudyGenerationController(
        IAIStudyService aiStudyService)
    {
        _aiStudyService = aiStudyService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateStudyRequest request)
    {
        try
        {
            var result =
                await _aiStudyService
                    .GenerateStudyAssetsAsync(request);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(
                StatusCodes.Status502BadGateway,
                new
                {
                    message =
                        "AI generation failed.",
                    error = ex.Message
                });
        }
    }
}