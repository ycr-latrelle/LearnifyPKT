using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Learnify.Api.DTOs.AI;

public class GenerateStudyFileRequest
{
    [Required]
    public string SubjectId { get; set; } = string.Empty;

    public string? Instructions { get; set; }

    [Required]
    public IFormFile? File { get; set; }
}