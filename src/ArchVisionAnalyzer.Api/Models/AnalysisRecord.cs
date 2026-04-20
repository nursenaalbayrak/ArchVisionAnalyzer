namespace ArchVisionAnalyzer.Api.Models;

public class AnalysisRecord
{
    public int Id { get; set; } // Otomatik artan birincil anahtar
    public string CodeSnippet { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Score { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}