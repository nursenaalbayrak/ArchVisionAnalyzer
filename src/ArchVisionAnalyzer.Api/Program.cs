using Microsoft.EntityFrameworkCore;
using ArchVisionAnalyzer.Api.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=archvision.db"));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "BU_COK_GIZLI_VE_UZUN_BIR_ANAHTAR_2026")),
            ValidateIssuer = false, 
            ValidateAudience = false,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

// 1. ADIM: Routing'i etkinleştir
app.UseRouting();

// 2. ADIM: CORS'u en esnek haliyle tam burada çalıştır
// (Authentication'dan ÖNCE gelmek zorunda!)
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

// 3. ADIM: Kimlik doğrulama
app.UseAuthentication();
app.UseAuthorization();

// 4. ADIM: Endpoint'leri bağla
app.MapControllers();

app.Run();