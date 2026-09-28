namespace Learnify.Api.Services.AI;

public interface IStudyFileExtractionService
{
    Task<string> ExtractTextAsync(
        IFormFile file);
}