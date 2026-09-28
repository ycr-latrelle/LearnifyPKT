using System.Security.Claims;
using Learnify.Api.DTOs.Study;
using Learnify.Api.Services.Study;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/subjects")]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(
        ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSubjects()
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var subjects =
            await _subjectService
                .GetSubjectsAsync(uid);

        return Ok(subjects);
    }

    [HttpGet("{subjectId}")]
    public async Task<IActionResult> GetSubject(
        string subjectId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var subject =
            await _subjectService
                .GetSubjectAsync(
                    uid,
                    subjectId);

        if (subject is null)
        {
            return NotFound(
                new
                {
                    message = "Subject not found."
                });
        }

        return Ok(subject);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSubject(
        [FromBody] CreateSubjectRequest request)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var subject =
            await _subjectService
                .CreateSubjectAsync(
                    uid,
                    request);

        return CreatedAtAction(
            nameof(GetSubject),
            new
            {
                subjectId = subject.Id
            },
            subject);
    }

    [HttpPut("{subjectId}")]
    public async Task<IActionResult> UpdateSubject(
        string subjectId,
        [FromBody] UpdateSubjectRequest request)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var subject =
            await _subjectService
                .UpdateSubjectAsync(
                    uid,
                    subjectId,
                    request);

        if (subject is null)
        {
            return NotFound(
                new
                {
                    message = "Subject not found."
                });
        }

        return Ok(subject);
    }

    [HttpDelete("{subjectId}")]
    public async Task<IActionResult> DeleteSubject(
        string subjectId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var deleted =
            await _subjectService
                .DeleteSubjectAsync(
                    uid,
                    subjectId);

        if (!deleted)
        {
            return NotFound(
                new
                {
                    message = "Subject not found."
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