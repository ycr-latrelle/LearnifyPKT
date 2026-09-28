using System.Security.Claims;
using Learnify.Api.DTOs.Study;
using Learnify.Api.Services.Study;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Learnify.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/subjects/{subjectId}/notes")]
public class NotesController : ControllerBase
{
    private readonly INoteService _noteService;

    public NotesController(
        INoteService noteService)
    {
        _noteService = noteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotes(
        string subjectId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var notes =
            await _noteService
                .GetNotesAsync(
                    uid,
                    subjectId);

        return Ok(notes);
    }

    [HttpGet("{noteId}")]
    public async Task<IActionResult> GetNote(
        string subjectId,
        string noteId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var note =
            await _noteService
                .GetNoteAsync(
                    uid,
                    subjectId,
                    noteId);

        if (note is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Note not found."
                });
        }

        return Ok(note);
    }

    [HttpPost]
    public async Task<IActionResult> CreateNote(
        string subjectId,
        [FromBody] CreateNoteRequest request)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var note =
            await _noteService
                .CreateNoteAsync(
                    uid,
                    subjectId,
                    request);

        if (note is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Subject not found."
                });
        }

        return CreatedAtAction(
            nameof(GetNote),
            new
            {
                subjectId,
                noteId = note.Id
            },
            note);
    }

    [HttpPut("{noteId}")]
    public async Task<IActionResult> UpdateNote(
        string subjectId,
        string noteId,
        [FromBody] UpdateNoteRequest request)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var note =
            await _noteService
                .UpdateNoteAsync(
                    uid,
                    subjectId,
                    noteId,
                    request);

        if (note is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Note not found."
                });
        }

        return Ok(note);
    }

    [HttpDelete("{noteId}")]
    public async Task<IActionResult> DeleteNote(
        string subjectId,
        string noteId)
    {
        var uid = GetUid();

        if (uid is null)
        {
            return Unauthorized();
        }

        var deleted =
            await _noteService
                .DeleteNoteAsync(
                    uid,
                    subjectId,
                    noteId);

        if (!deleted)
        {
            return NotFound(
                new
                {
                    message =
                        "Note not found."
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