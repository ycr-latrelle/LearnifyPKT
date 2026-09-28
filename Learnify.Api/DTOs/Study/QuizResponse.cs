namespace Learnify.Api.DTOs.Study;

public class QuizResponse
{
    public string Id { get; set; } = string.Empty;

    public string SubjectId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public List<QuizQuestionResponse> Questions { get; set; } = [];

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}

public class QuizQuestionResponse
{
    public string Id { get; set; } = string.Empty;

    public string Question { get; set; } = string.Empty;

    public List<string> Options { get; set; } = [];

    public int CorrectAnswer { get; set; }

    public string Explanation { get; set; } = string.Empty;
}