using Microsoft.EntityFrameworkCore;
using Imfo.WebApi.Models;

namespace Imfo.WebApi.Data;

public class ImfoDbContext : DbContext
{
    public ImfoDbContext(DbContextOptions<ImfoDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Asset> Assets { get; set; } = null!;
    public DbSet<BudgetItem> BudgetItems { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(eb =>
        {
            eb.HasKey(u => u.Id);
            eb.HasMany(u => u.Assets).WithOne(a => a.User).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
            eb.HasMany(u => u.BudgetItems).WithOne(b => b.User).HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);
            eb.HasMany(u => u.Transactions).WithOne(t => t.User).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Asset>(eb =>
        {
            eb.HasKey(a => a.Id);
        });

        modelBuilder.Entity<BudgetItem>(eb =>
        {
            eb.HasKey(b => b.Id);
        });

        modelBuilder.Entity<Transaction>(eb =>
        {
            eb.HasKey(t => t.Id);
        });
    }
}
