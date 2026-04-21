using Microsoft.EntityFrameworkCore;
using ArchVisionAnalyzer.Api.Models;

namespace ArchVisionAnalyzer.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<AnalysisRecord> Analyses { get; set; }
    public DbSet<User> Users { get; set; }
}
