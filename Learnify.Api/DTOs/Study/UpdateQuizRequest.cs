using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class UpdateQuizRequest
{
    [StringLength(200, MinimumLength = 1)]
    public string? Title { get; set; }

    [MinLength(1)]
    public List<UpdateQuizQuestionRequest>? Questions { get; set; }
}

public class UpdateQuizQuestionRequest
{
    public string? Id { get; set; }

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Question { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    [MaxLength(4)]
    public List<string> Options { get; set; } = [];

    [Range(0, 3)]
    public int CorrectAnswer { get; set; }

    [StringLength(2000)]
    public string Explanation { get; set; } = string.Empty;
}