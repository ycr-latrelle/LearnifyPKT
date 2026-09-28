using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class CreateQuizRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public List<CreateQuizQuestionRequest> Questions { get; set; } = [];
}

public class CreateQuizQuestionRequest
{
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