using Google.Cloud.Firestore;
using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public class FlashcardService : IFlashcardService
{
    private readonly FirestoreDb _firestore;

    public FlashcardService(FirestoreDb firestore)
    {
        _firestore = firestore;
    }

    public async Task<List<FlashcardResponse>>
        GetFlashcardsAsync(
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
            await subject.Reference
                .Collection("flashcards")
                .GetSnapshotAsync();

        return snapshot.Documents
            .Select(
                flashcard =>
                    ToResponse(
                        subjectId,
                        flashcard))
            .OrderByDescending(
                flashcard => flashcard.CreatedAt)
            .ToList();
    }

    public async Task<FlashcardResponse?>
        GetFlashcardAsync(
            string ownerUid,
            string subjectId,
            string flashcardId)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return null;
        }

        var flashcard =
            await subject.Reference
                .Collection("flashcards")
                .Document(flashcardId)
                .GetSnapshotAsync();

        if (!flashcard.Exists)
        {
            return null;
        }

        return ToResponse(
            subjectId,
            flashcard);
    }

    public async Task<FlashcardResponse?>
        CreateFlashcardAsync(
            string ownerUid,
            string subjectId,
            CreateFlashcardRequest request)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return null;
        }

        var front =
            request.Front.Trim();

        var back =
            request.Back.Trim();

        if (string.IsNullOrWhiteSpace(front))
        {
            throw new ArgumentException(
                "Flashcard front is required.");
        }

        if (string.IsNullOrWhiteSpace(back))
        {
            throw new ArgumentException(
                "Flashcard back is required.");
        }

        var flashcard =
            subject.Reference
                .Collection("flashcards")
                .Document();

        var now =
            Timestamp.GetCurrentTimestamp();

        var data =
            new Dictionary<string, object>
            {
                ["front"] = front,
                ["back"] = back,
                ["createdAt"] = now,
                ["updatedAt"] = now
            };

        await flashcard.SetAsync(data);

        return new FlashcardResponse
        {
            Id = flashcard.Id,
            SubjectId = subjectId,
            Front = front,
            Back = back,
            CreatedAt = now.ToDateTime(),
            UpdatedAt = now.ToDateTime()
        };
    }

    public async Task<FlashcardResponse?>
        UpdateFlashcardAsync(
            string ownerUid,
            string subjectId,
            string flashcardId,
            UpdateFlashcardRequest request)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return null;
        }

        var flashcard =
            subject.Reference
                .Collection("flashcards")
                .Document(flashcardId);

        var snapshot =
            await flashcard.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        var updates =
            new Dictionary<string, object>();

        if (request.Front is not null)
        {
            var front =
                request.Front.Trim();

            if (string.IsNullOrWhiteSpace(front))
            {
                throw new ArgumentException(
                    "Flashcard front cannot be empty.");
            }

            updates["front"] = front;
        }

        if (request.Back is not null)
        {
            var back =
                request.Back.Trim();

            if (string.IsNullOrWhiteSpace(back))
            {
                throw new ArgumentException(
                    "Flashcard back cannot be empty.");
            }

            updates["back"] = back;
        }

        if (updates.Count > 0)
        {
            updates["updatedAt"] =
                Timestamp.GetCurrentTimestamp();

            await flashcard.UpdateAsync(
                updates);
        }

        var updated =
            await flashcard.GetSnapshotAsync();

        return ToResponse(
            subjectId,
            updated);
    }

    public async Task<bool>
        DeleteFlashcardAsync(
            string ownerUid,
            string subjectId,
            string flashcardId)
    {
        var subject =
            await GetOwnedSubjectAsync(
                ownerUid,
                subjectId);

        if (subject is null)
        {
            return false;
        }

        var flashcard =
            subject.Reference
                .Collection("flashcards")
                .Document(flashcardId);

        var snapshot =
            await flashcard.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        await flashcard.DeleteAsync();

        return true;
    }

    private async Task<DocumentSnapshot?>
        GetOwnedSubjectAsync(
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

    private static FlashcardResponse ToResponse(
        string subjectId,
        DocumentSnapshot document)
    {
        var data =
            document.ToDictionary();

        return new FlashcardResponse
        {
            Id = document.Id,

            SubjectId =
                subjectId,

            Front =
                GetString(
                    data,
                    "front"),

            Back =
                GetString(
                    data,
                    "back"),

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