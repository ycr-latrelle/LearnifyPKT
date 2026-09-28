using System.Text;
using Microsoft.AspNetCore.Http;
using NPOI.XWPF.UserModel;
using UglyToad.PdfPig;

namespace Learnify.Api.Services.AI;

public class StudyFileExtractionService
    : IStudyFileExtractionService
{
    private static readonly HashSet<string>
        AllowedExtensions =
            new(StringComparer.OrdinalIgnoreCase)
            {
                ".txt",
                ".md",
                ".docx",
                ".pdf"
            };

    private const long MaxFileSize =
        10 * 1024 * 1024;

    private const int MaxExtractedCharacters =
        200_000;

    public async Task<string> ExtractTextAsync(
        IFormFile file)
    {
        if (file is null)
        {
            throw new ArgumentException(
                "A file is required.");
        }

        if (file.Length == 0)
        {
            throw new ArgumentException(
                "The uploaded file is empty.");
        }

        if (file.Length > MaxFileSize)
        {
            throw new ArgumentException(
                "The file cannot be larger than 10 MB.");
        }

        var extension =
            Path.GetExtension(
                file.FileName)
                .ToLowerInvariant();

        if (!AllowedExtensions.Contains(
            extension))
        {
            throw new ArgumentException(
                "Unsupported file type. " +
                "Supported files are MD, DOCX, PDF, and TXT.");
        }

        try
        {
            Encoding.RegisterProvider(
                CodePagesEncodingProvider.Instance);

            await using var stream =
                file.OpenReadStream();

            var extractedText =
                extension switch
                {
                    ".txt" =>
                        await ExtractTextFileAsync(
                            stream),

                    ".md" =>
                        await ExtractMarkdownAsync(
                            stream),

                    ".docx" =>
                        ExtractDocx(stream),

                    ".pdf" =>
                        ExtractPdf(stream),

                    _ =>
                        throw new ArgumentException(
                            "Unsupported file type. " +
                            "Supported files are MD, DOCX, PDF, and TXT.")
                };

            var cleanedText =
                CleanExtractedText(
                    extractedText);

            if (string.IsNullOrWhiteSpace(
                cleanedText))
            {
                throw new ArgumentException(
                    "The uploaded file contains no readable text.");
            }

            if (cleanedText.Length >
                MaxExtractedCharacters)
            {
                throw new ArgumentException(
                    "The file contains too much extracted text. " +
                    "Please upload a smaller document or split the material into multiple files.");
            }

            return cleanedText;
        }
        catch (ArgumentException)
        {
            throw;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(
                $"File extraction failed for '{file.FileName}': {ex}");

            throw new ArgumentException(
                "The file could not be read. " +
                "It may be corrupted, encrypted, or in an unsupported format.",
                ex);
        }
    }

    // ==================================================
    // TXT
    // ==================================================

    private static async Task<string>
        ExtractTextFileAsync(
            Stream stream)
    {
        using var reader =
            new StreamReader(
                stream,
                Encoding.UTF8,
                detectEncodingFromByteOrderMarks: true);

        return await reader.ReadToEndAsync();
    }

    // ==================================================
    // MARKDOWN
    // ==================================================

    private static async Task<string>
        ExtractMarkdownAsync(
            Stream stream)
    {
        using var reader =
            new StreamReader(
                stream,
                Encoding.UTF8,
                detectEncodingFromByteOrderMarks: true);

        return await reader.ReadToEndAsync();
    }

    // ==================================================
    // DOC
    // ==================================================
    // DOCX
    // ==================================================

    private static string ExtractDocx(
        Stream stream)
    {
        using var document =
            new XWPFDocument(stream);

        var builder =
            new StringBuilder();

        // Main document paragraphs
        foreach (
            var paragraph
            in document.Paragraphs)
        {
            AppendText(
                builder,
                paragraph.Text);
        }

        // Tables
        foreach (
            var table
            in document.Tables)
        {
            foreach (
                var row
                in table.Rows)
            {
                foreach (
                    var cell
                    in row.GetTableCells())
                {
                    foreach (
                        var paragraph
                        in cell.Paragraphs)
                    {
                        AppendText(
                            builder,
                            paragraph.Text);
                    }
                }
            }
        }

        // Headers
        foreach (
            var header
            in document.HeaderList)
        {
            foreach (
                var paragraph
                in header.Paragraphs)
            {
                AppendText(
                    builder,
                    paragraph.Text);
            }
        }

        // Footers
        foreach (
            var footer
            in document.FooterList)
        {
            foreach (
                var paragraph
                in footer.Paragraphs)
            {
                AppendText(
                    builder,
                    paragraph.Text);
            }
        }

        return builder.ToString();
    }

    // ==================================================
    // PDF
    // ==================================================

    private static string ExtractPdf(
        Stream stream)
    {
        using var document =
            PdfDocument.Open(stream);

        var builder =
            new StringBuilder();

        var pageNumber = 0;

        foreach (
            var page
            in document.GetPages())
        {
            pageNumber++;

            builder.AppendLine(
                $"--- Page {pageNumber} ---");

            foreach (
                var word
                in page.GetWords())
            {
                if (string.IsNullOrWhiteSpace(
                    word.Text))
                {
                    continue;
                }

                builder.Append(
                    word.Text);

                builder.Append(' ');
            }

            builder.AppendLine();
            builder.AppendLine();
        }

        return builder.ToString();
    }

    // ==================================================
    // HELPERS
    // ==================================================

    private static void AppendText(
        StringBuilder builder,
        string? text)
    {
        if (string.IsNullOrWhiteSpace(
            text))
        {
            return;
        }

        builder.AppendLine(
            text.Trim());
    }

    private static string CleanExtractedText(
        string text)
    {
        if (string.IsNullOrWhiteSpace(
            text))
        {
            return string.Empty;
        }

        var normalized =
            text
                .Replace("\0", string.Empty)
                .Replace("\r\n", "\n")
                .Replace('\r', '\n');

        var lines =
            normalized
                .Split(
                    '\n',
                    StringSplitOptions.None)
                .Select(line =>
                    line.TrimEnd())
                .ToList();

        var builder =
            new StringBuilder();

        var consecutiveBlankLines =
            0;

        foreach (var line in lines)
        {
            if (string.IsNullOrWhiteSpace(
                line))
            {
                consecutiveBlankLines++;

                if (consecutiveBlankLines > 2)
                {
                    continue;
                }

                builder.AppendLine();

                continue;
            }

            consecutiveBlankLines = 0;

            builder.AppendLine(
                line);
        }

        return builder
            .ToString()
            .Trim();
    }
}