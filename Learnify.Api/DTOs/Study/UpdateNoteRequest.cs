using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class UpdateNoteRequest
{
    [StringLength(200, MinimumLength = 1)]
    public string? Title { get; set; }

    public string? Content { get; set; }
}