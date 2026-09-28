using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.Study;

public class CreateSubjectRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }
}