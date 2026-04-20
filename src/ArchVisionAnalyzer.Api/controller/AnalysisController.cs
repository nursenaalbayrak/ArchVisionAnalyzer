using Microsoft.AspNetCore.Mvc;
using ArchVisionAnalyzer.Api.Data;
using ArchVisionAnalyzer.Api.Models;
using Microsoft.EntityFrameworkCore; 



namespace ArchVisionAnalyzer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly AppDbContext _context; // Veritabanı köprümüz

    // Constructor: .NET buraya AppDbContext'i otomatik getirir (Dependency Injection)
    public AnalysisController(AppDbContext context)
    {
        _context = context;
    }

   

[HttpGet("history")]
public async Task<IActionResult> GetHistory()
{
    // ToList() yerine ToListAsync() kullanarak veritabanı beklerken thread'i serbest bırakıyoruz
    var history = await _context.Analyses
        .OrderByDescending(x => x.CreatedAt)
        .ToListAsync(); 
        
    return Ok(history);
}

    [HttpPost("upload")]
    public async Task<IActionResult> AnalyzeCode([FromBody] string codeSnippet)
    {
        if (string.IsNullOrWhiteSpace(codeSnippet))
            return BadRequest(new { Message = "Kod boş olamaz." });

        using var client = new HttpClient();
        
        try 
        {
            // 1. AI Servisine Sor
            var response = await client.PostAsJsonAsync("http://127.0.0.1:8000/analyze", new { code = codeSnippet });
            
            if (!response.IsSuccessStatusCode) return StatusCode(500, "AI Servisi hata verdi.");

            var aiData = await response.Content.ReadFromJsonAsync<dynamic>();

            // 2. VERİTABANINA KAYDET (YENİ KISIM)
            var newRecord = new AnalysisRecord
            {
                CodeSnippet = codeSnippet,
                Status = aiData?.GetProperty("label").GetString() ?? "Unknown",
                Score = aiData?.GetProperty("score").GetInt32() ?? 0,
                Message = aiData?.GetProperty("detail").GetString() ?? "Analiz tamamlandı.",
                CreatedAt = DateTime.Now
            };

            _context.Analyses.Add(newRecord); // Listeye ekle
            await _context.SaveChangesAsync(); // Değişiklikleri veritabanına yaz

            // 3. Sonucu Dön
            return Ok(newRecord); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Hata: {ex.Message}");
        }
    }
}