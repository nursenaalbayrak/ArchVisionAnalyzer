using Microsoft.EntityFrameworkCore;
using ArchVisionAnalyzer.Api.Models;

namespace ArchVisionAnalyzer.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Bu, veritabanında 'Analyses' adında bir tablo oluşturur
    public DbSet<AnalysisRecord> Analyses { get; set; }
}