using Google.Cloud.Firestore;
using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public class NoteService : INoteService
{
    private readonly FirestoreDb _firestore;

    public NoteService(FirestoreDb firestore)
    {
        _firestore = firestore;
    }

    public async Task<List<NoteResponse>> GetNotesAsync(
        string ownerUid,
        string subjectId)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return [];
        }

        var snapshot =
            await subject
                .Reference
                .Collection("notes")
                .GetSnapshotAsync();

        return snapshot.Documents
            .Select(
                note =>
                    ToResponse(
                        subjectId,
                        note))
            .OrderByDescending(
                note => note.CreatedAt)
            .ToList();
    }

    public async Task<NoteResponse?> GetNoteAsync(
        string ownerUid,
        string subjectId,
        string noteId)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return null;
        }

        var note =
            await subject.Reference
                .Collection("notes")
                .Document(noteId)
                .GetSnapshotAsync();

        if (!note.Exists)
        {
            return null;
        }

        return ToResponse(
            subjectId,
            note);
    }

    public async Task<NoteResponse?> CreateNoteAsync(
        string ownerUid,
        string subjectId,
        CreateNoteRequest request)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return null;
        }

        var title =
            request.Title.Trim();

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException(
                "Note title is required.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Content))
        {
            throw new ArgumentException(
                "Note content is required.");
        }

        var note =
            subject.Reference
                .Collection("notes")
                .Document();

        var now =
            Timestamp.GetCurrentTimestamp();

        var data =
            new Dictionary<string, object>
            {
                ["title"] = title,
                ["content"] = request.Content,
                ["createdAt"] = now,
                ["updatedAt"] = now
            };

        await note.SetAsync(data);

        return new NoteResponse
        {
            Id = note.Id,
            SubjectId = subjectId,
            Title = title,
            Content = request.Content,
            CreatedAt = now.ToDateTime(),
            UpdatedAt = now.ToDateTime()
        };
    }

    public async Task<NoteResponse?> UpdateNoteAsync(
        string ownerUid,
        string subjectId,
        string noteId,
        UpdateNoteRequest request)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return null;
        }

        var note =
            subject.Reference
                .Collection("notes")
                .Document(noteId);

        var snapshot =
            await note.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        var updates =
            new Dictionary<string, object>();

        if (request.Title is not null)
        {
            var title =
                request.Title.Trim();

            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException(
                    "Note title cannot be empty.");
            }

            updates["title"] = title;
        }

        if (request.Content is not null)
        {
            if (string.IsNullOrWhiteSpace(
                    request.Content))
            {
                throw new ArgumentException(
                    "Note content cannot be empty.");
            }

            updates["content"] =
                request.Content;
        }

        if (updates.Count > 0)
        {
            updates["updatedAt"] =
                Timestamp.GetCurrentTimestamp();

            await note.UpdateAsync(updates);
        }

        var updated =
            await note.GetSnapshotAsync();

        return ToResponse(
            subjectId,
            updated);
    }

    public async Task<bool> DeleteNoteAsync(
        string ownerUid,
        string subjectId,
        string noteId)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return false;
        }

        var note =
            subject.Reference
                .Collection("notes")
                .Document(noteId);

        var snapshot =
            await note.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        await note.DeleteAsync();

        return true;
    }

    private async Task<DocumentSnapshot?> GetOwnedSubjectAsync(
        string ownerUid,
        string subjectId)
    {
        var subject =
            await _firestore
                .Collection("subjects")
                .Document(subjectId)
                .GetSnapshotAsync();

        if (!subject.Exists)
        {
            return null;
        }

        var data =
            subject.ToDictionary();

        if (!data.TryGetValue(
                "ownerUid",
                out var ownerObject))
        {
            return null;
        }

        if (!string.Equals(
                ownerObject?.ToString(),
                ownerUid,
                StringComparison.Ordinal))
        {
            return null;
        }

        return subject;
    }

    private static NoteResponse ToResponse(
        string subjectId,
        DocumentSnapshot document)
    {
        var data =
            document.ToDictionary();

        return new NoteResponse
        {
            Id = document.Id,
            SubjectId = subjectId,

            Title =
                GetString(
                    data,
                    "title"),

            Content =
                GetString(
                    data,
                    "content"),

            CreatedAt =
                GetTimestamp(
                    data,
                    "createdAt"),

            UpdatedAt =
                GetTimestamp(
                    data,
                    "updatedAt")
        };
    }

    private static string GetString(
        Dictionary<string, object> data,
        string key)
    {
        return data.TryGetValue(
                   key,
                   out var value)
            ? value?.ToString() ?? string.Empty
            : string.Empty;
    }

    private static DateTime GetTimestamp(
        Dictionary<string, object> data,
        string key)
    {
        return data.TryGetValue(
                   key,
                   out var value)
               && value is Timestamp timestamp
            ? timestamp.ToDateTime()
            : DateTime.UtcNow;
    }
}