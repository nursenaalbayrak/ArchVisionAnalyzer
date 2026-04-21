using Microsoft.AspNetCore.Mvc;
using ArchVisionAnalyzer.Api.Data;
using ArchVisionAnalyzer.Api.Models;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace ArchVisionAnalyzer.Api.Controllers;

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class LoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest(new { Message = "Bu kullanıcı adı zaten alınmış." });

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Email = dto.Email,
            CreatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Kayıt başarılı!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1. Kullanıcıyı bul
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        
        // 2. Şifreyi doğrula
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { Message = "Geçersiz kullanıcı adı veya şifre." });

        // 3. JWT Token Oluşturma (Gerçek Versiyon)
        var token = CreateToken(user);

        return Ok(new { 
            Token = token, 
            UserId = user.Id, 
            Username = user.Username, 
            Message = "Giriş başarılı!" 
        });
    }

    // JWT Oluşturma Yardımcı Metodu
    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(1), // 1 gün geçerli
            SigningCredentials = creds,
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}