using Learnify.Api.DTOs.AI;

namespace Learnify.Api.Services.AI;

public interface IAIStudyService
{
    Task<GenerateStudyResponse> GenerateStudyAssetsAsync(
        GenerateStudyRequest request);
}