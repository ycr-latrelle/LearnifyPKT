namespace Learnify.Api.DTOs.AI;

public class GenerateStudyResponse
{
    // --------------------------------------------------
    // SOURCE CONTEXT
    // --------------------------------------------------

    public string SourceFileName { get; set; } = string.Empty;

    public string SourceType { get; set; } = string.Empty;

    // --------------------------------------------------
    // GENERATED STUDY CONTENT
    // --------------------------------------------------

    public string Summary { get; set; } = string.Empty;

    public string NoteTitle { get; set; } = string.Empty;

    public string NoteContent { get; set; } = string.Empty;

    public List<GeneratedFlashcard> Flashcards { get; set; } = [];

    public List<GeneratedQuizQuestion> Quiz { get; set; } = [];

    public List<GeneratedPracticeExercise> Practice { get; set; } = [];
}

// ==================================================
// FLASHCARD
// ==================================================

public class GeneratedFlashcard
{
    public string Front { get; set; } = string.Empty;

    public string Back { get; set; } = string.Empty;
}

// ==================================================
// QUIZ
// ==================================================

public class GeneratedQuizQuestion
{
    public string Question { get; set; } = string.Empty;

    public List<string> Options { get; set; } = [];

    // Zero-based index.
    // Example:
    // 0 = first option
    // 1 = second option
    // 2 = third option
    // 3 = fourth option
    public int CorrectAnswer { get; set; }

    public string Explanation { get; set; } = string.Empty;
}

// ==================================================
// PRACTICE
// ==================================================

public class GeneratedPracticeExercise
{
    public string Title { get; set; } = string.Empty;

    public string Instruction { get; set; } = string.Empty;

    public string StarterCode { get; set; } = string.Empty;
}