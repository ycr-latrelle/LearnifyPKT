using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class CreateNoteRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;
}