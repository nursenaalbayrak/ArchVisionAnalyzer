using Microsoft.AspNetCore.Mvc;
using ArchVisionAnalyzer.Api.Data;
using ArchVisionAnalyzer.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace ArchVisionAnalyzer.Api.Controllers;

public class AnalysisRequest
{
    public int UserId { get; set; } 
    public string Code1 { get; set; } = string.Empty;
    public string Code2 { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalysisController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("history/{userId}")]
    public async Task<IActionResult> GetUserHistory(int userId)
    {
        var history = await _context.Analyses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(history);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var history = await _context.Analyses
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
            
        return Ok(history);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> AnalyzeCode([FromBody] AnalysisRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code1) || string.IsNullOrWhiteSpace(request.Code2))
            return BadRequest(new { Message = "Analiz için her iki kod alanı da dolu olmalıdır." });

        using var client = new HttpClient();
        
        try 
        {
            var response = await client.PostAsJsonAsync("http://127.0.0.1:8000/analyze", new { 
                code1 = request.Code1, 
                code2 = request.Code2 
            });
            
            if (!response.IsSuccessStatusCode) 
                return StatusCode(500, "AI Servisi (Python) hata döndürdü.");

            var aiData = await response.Content.ReadFromJsonAsync<dynamic>();

            var newRecord = new AnalysisRecord
            {
                UserId = request.UserId, 
                CodeSnippet = $"Code 1: {request.Code1.Substring(0, Math.Min(request.Code1.Length, 50))}... | Code 2: {request.Code2.Substring(0, Math.Min(request.Code2.Length, 50))}...",
                Status = aiData?.GetProperty("label").GetString() ?? "Unknown",
                Score = aiData?.GetProperty("score").GetInt32() ?? 0,
                Message = aiData?.GetProperty("detail").GetString() ?? "Çiftli kod analizi tamamlandı.",
                CreatedAt = DateTime.Now
            };

            _context.Analyses.Add(newRecord);
            await _context.SaveChangesAsync();
            
            return Ok(newRecord); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Bağlantı Hatası: {ex.Message}");
        }
    }

    [HttpGet("user-stats/{userId}")]
    public async Task<IActionResult> GetUserStats(int userId)
    {
        var userAnalyses = await _context.Analyses.Where(a => a.UserId == userId).ToListAsync();

        if (!userAnalyses.Any())
            return Ok(new { total = 0, averageScore = 0, cloneCount = 0, originalCount = 0 });

        var stats = new
        {
            Total = userAnalyses.Count,
            AverageScore = Math.Round(userAnalyses.Average(a => a.Score), 2),
            CloneCount = userAnalyses.Count(a => a.Score > 70), 
            OriginalCount = userAnalyses.Count(a => a.Score <= 70)
        };

        return Ok(stats);
    }
}