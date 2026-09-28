using Google.Cloud.Firestore;
using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public class SubjectService : ISubjectService
{
    private readonly FirestoreDb _firestore;

    public SubjectService(FirestoreDb firestore)
    {
        _firestore = firestore;
    }

    public async Task<List<SubjectResponse>> GetSubjectsAsync(
        string ownerUid)
    {
        var snapshot = await _firestore
            .Collection("subjects")
            .WhereEqualTo("ownerUid", ownerUid)
            .GetSnapshotAsync();

        return snapshot.Documents
            .Select(ToResponse)
            .OrderByDescending(subject => subject.CreatedAt)
            .ToList();
    }

    public async Task<SubjectResponse?> GetSubjectAsync(
        string ownerUid,
        string subjectId)
    {
        var document = _firestore
            .Collection("subjects")
            .Document(subjectId);

        var snapshot = await document.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        var data = snapshot.ToDictionary();

        if (!IsOwnedBy(data, ownerUid))
        {
            return null;
        }

        return ToResponse(snapshot);
    }

    public async Task<SubjectResponse> CreateSubjectAsync(
        string ownerUid,
        CreateSubjectRequest request)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Subject name is required.");
        }

        var document = _firestore
            .Collection("subjects")
            .Document();

        var now = Timestamp.GetCurrentTimestamp();

        var data = new Dictionary<string, object>
        {
            ["ownerUid"] = ownerUid,
            ["name"] = name,
            ["description"] =
                request.Description?.Trim() ?? string.Empty,
            ["icon"] =
                string.IsNullOrWhiteSpace(request.Icon)
                    ? "book"
                    : request.Icon.Trim(),
            ["color"] =
                string.IsNullOrWhiteSpace(request.Color)
                    ? "blue"
                    : request.Color.Trim().ToLowerInvariant(),
            ["createdAt"] = now,
            ["updatedAt"] = now
        };

        await document.SetAsync(data);

        return new SubjectResponse
        {
            Id = document.Id,
            Name = name,
            Description =
                data["description"]?.ToString(),
            Icon =
                data["icon"]?.ToString(),
            Color =
                data["color"]?.ToString(),
            CreatedAt =
                now.ToDateTime(),
            UpdatedAt =
                now.ToDateTime()
        };
    }

    public async Task<SubjectResponse?> UpdateSubjectAsync(
        string ownerUid,
        string subjectId,
        UpdateSubjectRequest request)
    {
        var document = _firestore
            .Collection("subjects")
            .Document(subjectId);

        var snapshot = await document.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return null;
        }

        var data = snapshot.ToDictionary();

        if (!IsOwnedBy(data, ownerUid))
        {
            return null;
        }

        var updates =
            new Dictionary<string, object>();

        if (request.Name is not null)
        {
            var name = request.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Subject name cannot be empty.");
            }

            updates["name"] = name;
        }

        if (request.Description is not null)
        {
            updates["description"] =
                request.Description.Trim();
        }

        if (request.Icon is not null)
        {
            updates["icon"] =
                request.Icon.Trim();
        }

        if (request.Color is not null)
        {
            updates["color"] =
                request.Color.Trim().ToLowerInvariant();
        }

        if (updates.Count > 0)
        {
            updates["updatedAt"] =
                Timestamp.GetCurrentTimestamp();

            await document.UpdateAsync(updates);
        }

        var updatedSnapshot =
            await document.GetSnapshotAsync();

        return ToResponse(updatedSnapshot);
    }

    public async Task<bool> DeleteSubjectAsync(
        string ownerUid,
        string subjectId)
    {
        var document = _firestore
            .Collection("subjects")
            .Document(subjectId);

        var snapshot = await document.GetSnapshotAsync();

        if (!snapshot.Exists)
        {
            return false;
        }

        var data = snapshot.ToDictionary();

        if (!IsOwnedBy(data, ownerUid))
        {
            return false;
        }

        // Delete all direct notes first.
        var notesSnapshot = await document
            .Collection("notes")
            .GetSnapshotAsync();

        if (notesSnapshot.Count > 0)
        {
            const int batchSize = 450;

            for (
                var i = 0;
                i < notesSnapshot.Documents.Count;
                i += batchSize)
            {
                var batch =
                    _firestore.StartBatch();

                foreach (
                    var note in notesSnapshot.Documents
                        .Skip(i)
                        .Take(batchSize))
                {
                    batch.Delete(note.Reference);
                }

                await batch.CommitAsync();
            }
        }

        await document.DeleteAsync();

        return true;
    }

    private static bool IsOwnedBy(
        Dictionary<string, object> data,
        string ownerUid)
    {
        return data.TryGetValue(
                   "ownerUid",
                   out var ownerObject)
               &&
               string.Equals(
                   ownerObject?.ToString(),
                   ownerUid,
                   StringComparison.Ordinal);
    }

    private static SubjectResponse ToResponse(
        DocumentSnapshot document)
    {
        var data = document.ToDictionary();

        return new SubjectResponse
        {
            Id = document.Id,

            Name =
                GetString(data, "name"),

            Description =
                GetNullableString(data, "description"),

            Icon =
                GetNullableString(data, "icon"),

            Color =
                GetNullableString(data, "color"),

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
        return data.TryGetValue(key, out var value)
            ? value?.ToString() ?? string.Empty
            : string.Empty;
    }

    private static string? GetNullableString(
        Dictionary<string, object> data,
        string key)
    {
        return data.TryGetValue(key, out var value)
            ? value?.ToString()
            : null;
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