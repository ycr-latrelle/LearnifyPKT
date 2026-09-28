using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public interface IFlashcardService
{
    Task<List<FlashcardResponse>> GetFlashcardsAsync(
        string ownerUid,
        string subjectId);

    Task<FlashcardResponse?> GetFlashcardAsync(
        string ownerUid,
        string subjectId,
        string flashcardId);

    Task<FlashcardResponse?> CreateFlashcardAsync(
        string ownerUid,
        string subjectId,
        CreateFlashcardRequest request);

    Task<FlashcardResponse?> UpdateFlashcardAsync(
        string ownerUid,
        string subjectId,
        string flashcardId,
        UpdateFlashcardRequest request);

    Task<bool> DeleteFlashcardAsync(
        string ownerUid,
        string subjectId,
        string flashcardId);
}