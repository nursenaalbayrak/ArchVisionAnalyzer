using Microsoft.EntityFrameworkCore;
using ArchVisionAnalyzer.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. CORS Ayarlarını Yapılandır
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// 2. Veritabanı (DbContext) Kaydını Yap
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=archvision.db"));

// 3. Temel API Servislerini Ekle
builder.Services.AddControllers();
builder.Services.AddOpenApi(); // Swagger/OpenAPI desteği

var app = builder.Build();

// 4. HTTP İletişim Hattını (Middleware Pipeline) Yapılandır
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Güvenlik ve Yönlendirme
app.UseHttpsRedirection();

// KRİTİK: UseCors mutlaka UseRouting'den sonra, MapControllers'tan önce gelmeli
app.UseCors("AllowReactApp");

app.UseAuthorization();

// 5. Endpoint'leri Haritala
app.MapControllers();

app.Run();