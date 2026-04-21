using Microsoft.AspNetCore.Mvc;
using ArchVisionAnalyzer.Api.Data;
using ArchVisionAnalyzer.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ArchVisionAnalyzer.Api.Controllers;

// Frontend'den gelecek çiftli kod yapısı için DTO (Data Transfer Object)
public class AnalysisRequest
{
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
        // 1. Validasyon: İki kodun da dolu olduğundan emin ol
        if (string.IsNullOrWhiteSpace(request.Code1) || string.IsNullOrWhiteSpace(request.Code2))
            return BadRequest(new { Message = "Analiz için her iki kod alanı da dolu olmalıdır." });

        using var client = new HttpClient();
        
        try 
        {
            // 2. AI Servisine (Python) iki kodu birden gönder
            // Python tarafında 'code1' ve 'code2' anahtarlarını bekliyoruz
            var response = await client.PostAsJsonAsync("http://127.0.0.1:8000/analyze", new { 
                code1 = request.Code1, 
                code2 = request.Code2 
            });
            
            if (!response.IsSuccessStatusCode) 
                return StatusCode(500, "AI Servisi (Python) hata döndürdü.");

            var aiData = await response.Content.ReadFromJsonAsync<dynamic>();

            // 3. Veritabanına Kaydet
            // CodeSnippet alanına iki kodu birleştirerek veya belirleyici bir formatta kaydediyoruz
            var newRecord = new AnalysisRecord
            {
                CodeSnippet = $"Code 1: {request.Code1.Take(50)}... | Code 2: {request.Code2.Take(50)}...",
                Status = aiData?.GetProperty("label").GetString() ?? "Unknown",
                Score = aiData?.GetProperty("score").GetInt32() ?? 0,
                Message = aiData?.GetProperty("detail").GetString() ?? "Çiftli kod analizi tamamlandı.",
                CreatedAt = DateTime.Now
            };

            _context.Analyses.Add(newRecord);
            await _context.SaveChangesAsync();

            // 4. Sonucu Dön
            return Ok(newRecord); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Bağlantı Hatası: {ex.Message}");
        }
    }
}