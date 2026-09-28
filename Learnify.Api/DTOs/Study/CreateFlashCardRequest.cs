using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class CreateFlashcardRequest
{
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string Front { get; set; } = string.Empty;

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Back { get; set; } = string.Empty;
}