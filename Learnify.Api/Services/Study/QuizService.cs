using Google.Cloud.Firestore;
using Learnify.Api.DTOs.Study;

namespace Learnify.Api.Services.Study;

public class QuizService : IQuizService
{
    private readonly FirestoreDb _firestoreDb;

    public QuizService(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    // ==================================================
    // GET ALL QUIZZES
    // ==================================================

    public async Task<List<QuizResponse>> GetQuizzesAsync(
        string ownerUid,
        string subjectId)
    {
        await EnsureSubjectOwnershipAsync(
            ownerUid,
            subjectId);

        var snapshot =
            await GetQuizCollection(subjectId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

        return snapshot.Documents
            .Select(ToResponse)
            .ToList();
    }

    // ==================================================
    // GET SINGLE QUIZ
    // ==================================================

    public async Task<QuizResponse?> GetQuizAsync(
        string ownerUid,
        string subjectId,
        string quizId)
    {
        await EnsureSubjectOwnershipAsync(
            ownerUid,
            subjectId);

        var document =
            await GetQuizCollection(subjectId)
                .Document(quizId)
                .GetSnapshotAsync();

        if (!document.Exists)
        {
            return null;
        }

        return ToResponse(document);
    }

    // ==================================================
    // CREATE QUIZ
    // ==================================================

    public async Task<QuizResponse?> CreateQuizAsync(
        string ownerUid,
        string subjectId,
        CreateQuizRequest request)
    {
        await EnsureSubjectOwnershipAsync(
            ownerUid,
            subjectId);

        ValidateQuestions(
            request.Questions);

        var quizReference =
            GetQuizCollection(subjectId)
                .Document();

        var now =
            Timestamp.GetCurrentTimestamp();

        var questions =
            request.Questions
                .Select(question =>
                    new Dictionary<string, object>
                    {
                        ["id"] =
                            Guid.NewGuid()
                                .ToString("N"),

                        ["question"] =
                            question.Question.Trim(),

                        ["options"] =
                            question.Options
                                .Select(option =>
                                    option.Trim())
                                .ToList(),

                        ["correctAnswer"] =
                            question.CorrectAnswer,

                        ["explanation"] =
                            question.Explanation?
                                .Trim() ?? string.Empty
                    })
                .ToList();

        var data =
            new Dictionary<string, object>
            {
                ["subjectId"] =
                    subjectId,

                ["ownerUid"] =
                    ownerUid,

                ["title"] =
                    request.Title.Trim(),

                ["questions"] =
                    questions,

                ["createdAt"] =
                    now,

                ["updatedAt"] =
                    now
            };

        await quizReference.CreateAsync(data);

        var createdDocument =
            await quizReference
                .GetSnapshotAsync();

        return ToResponse(createdDocument);
    }

    // ==================================================
    // UPDATE QUIZ
    // ==================================================

    public async Task<QuizResponse?> UpdateQuizAsync(
        string ownerUid,
        string subjectId,
        string quizId,
        UpdateQuizRequest request)
    {
        await EnsureSubjectOwnershipAsync(
            ownerUid,
            subjectId);

        var quizReference =
            GetQuizCollection(subjectId)
                .Document(quizId);

        var document =
            await quizReference
                .GetSnapshotAsync();

        if (!document.Exists)
        {
            return null;
        }

        var updates =
            new Dictionary<string, object>
            {
                ["updatedAt"] =
                    Timestamp.GetCurrentTimestamp()
            };

        if (request.Title is not null)
        {
            var trimmedTitle =
                request.Title.Trim();

            if (string.IsNullOrWhiteSpace(
                trimmedTitle))
            {
                throw new ArgumentException(
                    "Quiz title cannot be empty.");
            }

            updates["title"] =
                trimmedTitle;
        }

        if (request.Questions is not null)
        {
            ValidateQuestions(
                request.Questions);

            var questions =
                request.Questions
                    .Select(question =>
                        new Dictionary<string, object>
                        {
                            ["id"] =
                                string.IsNullOrWhiteSpace(
                                    question.Id)
                                    ? Guid.NewGuid()
                                        .ToString("N")
                                    : question.Id!,

                            ["question"] =
                                question.Question.Trim(),

                            ["options"] =
                                question.Options
                                    .Select(option =>
                                        option.Trim())
                                    .ToList(),

                            ["correctAnswer"] =
                                question.CorrectAnswer,

                            ["explanation"] =
                                question.Explanation?
                                    .Trim() ??
                                string.Empty
                        })
                    .ToList();

            updates["questions"] =
                questions;
        }

        await quizReference.UpdateAsync(
            updates);

        var updatedDocument =
            await quizReference
                .GetSnapshotAsync();

        return ToResponse(updatedDocument);
    }

    // ==================================================
    // DELETE QUIZ
    // ==================================================

    public async Task<bool> DeleteQuizAsync(
        string ownerUid,
        string subjectId,
        string quizId)
    {
        await EnsureSubjectOwnershipAsync(
            ownerUid,
            subjectId);

        var quizReference =
            GetQuizCollection(subjectId)
                .Document(quizId);

        var document =
            await quizReference
                .GetSnapshotAsync();

        if (!document.Exists)
        {
            return false;
        }

        await quizReference.DeleteAsync();

        return true;
    }

    // ==================================================
    // SUBJECT OWNERSHIP
    // ==================================================

    private async Task EnsureSubjectOwnershipAsync(
        string ownerUid,
        string subjectId)
    {
        var subjectReference =
            _firestoreDb
                .Collection("subjects")
                .Document(subjectId);

        var subjectSnapshot =
            await subjectReference
                .GetSnapshotAsync();

        if (!subjectSnapshot.Exists)
        {
            throw new ArgumentException(
                "Subject not found.");
        }

        var subjectData =
            subjectSnapshot.ToDictionary();

        var subjectOwnerUid =
            subjectData.TryGetValue(
                "ownerUid",
                out var ownerValue)
                ? ownerValue?.ToString()
                : null;

        if (!string.Equals(
            subjectOwnerUid,
            ownerUid,
            StringComparison.Ordinal))
        {
            throw new UnauthorizedAccessException(
                "You do not have access to this subject.");
        }
    }

    // ==================================================
    // COLLECTION
    // ==================================================

    private CollectionReference GetQuizCollection(
        string subjectId)
    {
        return _firestoreDb
            .Collection("subjects")
            .Document(subjectId)
            .Collection("quizzes");
    }

    // ==================================================
    // VALIDATION
    // ==================================================

    private static void ValidateQuestions(
        IEnumerable<CreateQuizQuestionRequest>
            questions)
    {
        var questionList =
            questions?.ToList() ?? [];

        if (questionList.Count == 0)
        {
            throw new ArgumentException(
                "A quiz must contain at least one question.");
        }

        foreach (var question in questionList)
        {
            ValidateQuestion(
                question.Question,
                question.Options,
                question.CorrectAnswer);
        }
    }

    private static void ValidateQuestions(
        IEnumerable<UpdateQuizQuestionRequest>
            questions)
    {
        var questionList =
            questions?.ToList() ?? [];

        if (questionList.Count == 0)
        {
            throw new ArgumentException(
                "A quiz must contain at least one question.");
        }

        foreach (var question in questionList)
        {
            ValidateQuestion(
                question.Question,
                question.Options,
                question.CorrectAnswer);
        }
    }

    private static void ValidateQuestion(
        string question,
        List<string> options,
        int correctAnswer)
    {
        if (string.IsNullOrWhiteSpace(question))
        {
            throw new ArgumentException(
                "Quiz question cannot be empty.");
        }

        if (options is null ||
            options.Count != 4)
        {
            throw new ArgumentException(
                "Each quiz question must have exactly 4 options.");
        }

        if (options.Any(
            string.IsNullOrWhiteSpace))
        {
            throw new ArgumentException(
                "Quiz options cannot be empty.");
        }

        if (correctAnswer < 0 ||
            correctAnswer > 3)
        {
            throw new ArgumentException(
                "CorrectAnswer must be between 0 and 3.");
        }
    }

    // ==================================================
    // FIRESTORE → RESPONSE
    // ==================================================

    private static QuizResponse ToResponse(
        DocumentSnapshot document)
    {
        var data =
            document.ToDictionary();

        var questions =
            new List<QuizQuestionResponse>();

        if (data.TryGetValue(
            "questions",
            out var questionsValue) &&
            questionsValue is IEnumerable<object>
                questionObjects)
        {
            foreach (
                var questionObject
                in questionObjects)
            {
                if (questionObject is not
                    IDictionary<string, object>
                    questionData)
                {
                    continue;
                }

                var options =
                    questionData.TryGetValue(
                        "options",
                        out var optionsValue) &&
                    optionsValue is IEnumerable<object>
                        optionObjects
                        ? optionObjects
                            .Select(option =>
                                option?.ToString() ??
                                string.Empty)
                            .ToList()
                        : [];

                var correctAnswer =
                    questionData.TryGetValue(
                        "correctAnswer",
                        out var correctValue)
                        ? Convert.ToInt32(
                            correctValue)
                        : 0;

                questions.Add(
                    new QuizQuestionResponse
                    {
                        Id =
                            questionData.TryGetValue(
                                "id",
                                out var idValue)
                                ? idValue?.ToString() ??
                                  string.Empty
                                : string.Empty,

                        Question =
                            questionData.TryGetValue(
                                "question",
                                out var questionValue)
                                ? questionValue?.ToString() ??
                                  string.Empty
                                : string.Empty,

                        Options =
                            options,

                        CorrectAnswer =
                            correctAnswer,

                        Explanation =
                            questionData.TryGetValue(
                                "explanation",
                                out var explanationValue)
                                ? explanationValue?.ToString() ??
                                  string.Empty
                                : string.Empty
                    });
            }
        }

        return new QuizResponse
        {
            Id =
                document.Id,

            SubjectId =
                data.TryGetValue(
                    "subjectId",
                    out var subjectIdValue)
                    ? subjectIdValue?.ToString() ??
                      string.Empty
                    : string.Empty,

            Title =
                data.TryGetValue(
                    "title",
                    out var titleValue)
                    ? titleValue?.ToString() ??
                      "Untitled Quiz"
                    : "Untitled Quiz",

            Questions =
                questions,

            CreatedAt =
                GetDateTime(
                    data,
                    "createdAt"),

            UpdatedAt =
                GetDateTime(
                    data,
                    "updatedAt")
        };
    }

    private static DateTime GetDateTime(
        IDictionary<string, object> data,
        string key)
    {
        if (!data.TryGetValue(
            key,
            out var value))
        {
            return DateTime.UtcNow;
        }

        if (value is Timestamp timestamp)
        {
            return timestamp.ToDateTime();
        }

        if (value is DateTime dateTime)
        {
            return dateTime;
        }

        return DateTime.UtcNow;
    }
}