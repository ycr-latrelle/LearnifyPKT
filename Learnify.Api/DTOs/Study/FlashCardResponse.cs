namespace Learnify.Api.DTOs.Study;

public class FlashcardResponse
{
    public string Id { get; set; } = string.Empty;

    public string SubjectId { get; set; } = string.Empty;

    public string Front { get; set; } = string.Empty;

    public string Back { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}