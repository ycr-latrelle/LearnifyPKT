using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public interface INoteService
{
    Task<List<NoteResponse>> GetNotesAsync(
        string ownerUid,
        string subjectId);

    Task<NoteResponse?> GetNoteAsync(
        string ownerUid,
        string subjectId,
        string noteId);

    Task<NoteResponse?> CreateNoteAsync(
        string ownerUid,
        string subjectId,
        CreateNoteRequest request);

    Task<NoteResponse?> UpdateNoteAsync(
        string ownerUid,
        string subjectId,
        string noteId,
        UpdateNoteRequest request);

    Task<bool> DeleteNoteAsync(
        string ownerUid,
        string subjectId,
        string noteId);
}