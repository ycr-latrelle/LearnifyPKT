using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class UpdateFlashcardRequest
{
    [StringLength(500, MinimumLength = 1)]
    public string? Front { get; set; }

    [StringLength(2000, MinimumLength = 1)]
    public string? Back { get; set; }
}