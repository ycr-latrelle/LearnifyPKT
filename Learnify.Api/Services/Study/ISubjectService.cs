using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public interface ISubjectService
{
    Task<List<SubjectResponse>> GetSubjectsAsync(
        string ownerUid);

    Task<SubjectResponse?> GetSubjectAsync(
        string ownerUid,
        string subjectId);

    Task<SubjectResponse> CreateSubjectAsync(
        string ownerUid,
        CreateSubjectRequest request);

    Task<SubjectResponse?> UpdateSubjectAsync(
        string ownerUid,
        string subjectId,
        UpdateSubjectRequest request);

    Task<bool> DeleteSubjectAsync(
        string ownerUid,
        string subjectId);
}