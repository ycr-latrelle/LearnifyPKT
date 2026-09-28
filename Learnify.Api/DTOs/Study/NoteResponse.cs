namespace Learnify.Api.DTOs.Study;

public class NoteResponse
{
    public string Id { get; set; } = string.Empty;

    public string SubjectId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}