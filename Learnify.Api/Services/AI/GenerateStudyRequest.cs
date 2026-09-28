using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.AI;

public class GenerateStudyRequest
{
    [Required]
    public string SubjectId { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Instructions { get; set; }
}