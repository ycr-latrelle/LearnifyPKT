using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public interface IQuizService
{
    Task<List<QuizResponse>> GetQuizzesAsync(
        string ownerUid,
        string subjectId);

    Task<QuizResponse?> GetQuizAsync(
        string ownerUid,
        string subjectId,
        string quizId);

    Task<QuizResponse?> CreateQuizAsync(
        string ownerUid,
        string subjectId,
        CreateQuizRequest request);

    Task<QuizResponse?> UpdateQuizAsync(
        string ownerUid,
        string subjectId,
        string quizId,
        UpdateQuizRequest request);

    Task<bool> DeleteQuizAsync(
        string ownerUid,
        string subjectId,
        string quizId);
}