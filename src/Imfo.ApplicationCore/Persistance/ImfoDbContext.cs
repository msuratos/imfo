using Microsoft.EntityFrameworkCore;
using Imfo.ApplicationCore.Persistance.Entities;

namespace Imfo.ApplicationCore.Persistance;

public class ImfoDbContext : DbContext
{
    public ImfoDbContext(DbContextOptions<ImfoDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<ScheduledTransaction> ScheduledTransactions { get; set; } = null!;
    public DbSet<Budget> Budgets { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(eb =>
        {
            eb.HasKey(u => u.Id);
            eb.HasMany(u => u.ScheduledTransactions).WithOne(i => i.User).HasForeignKey(i => i.UserId).OnDelete(DeleteBehavior.Cascade);
            eb.HasMany(u => u.Budgets).WithOne(b => b.User).HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);
            eb.HasMany(u => u.Transactions).WithOne(t => t.User).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ScheduledTransaction>(eb =>
        {
            eb.HasKey(i => i.Id);
        });

        modelBuilder.Entity<Budget>(eb =>
        {
            eb.HasKey(b => b.Id);
        });

        modelBuilder.Entity<Category>(eb =>
        {
            eb.HasKey(c => c.Id);
            eb.HasOne(c => c.User).WithMany(u => u.Categories).HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Transaction>(eb =>
        {
            eb.HasKey(t => t.Id);
        });

        // Seed common categories (global - UserId == Guid.Empty)
        var globalUserId = Guid.Empty;
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = Guid.NewGuid(), Name = "Salary", Type = CategoryType.Income, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Interest", Type = CategoryType.Income, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Other Income", Type = CategoryType.Income, UserId = globalUserId },

            new Category { Id = Guid.NewGuid(), Name = "Rent", Type = CategoryType.Expense, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Groceries", Type = CategoryType.Expense, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Utilities", Type = CategoryType.Expense, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Transport", Type = CategoryType.Expense, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Entertainment", Type = CategoryType.Expense, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Healthcare", Type = CategoryType.Expense, UserId = globalUserId },
            new Category { Id = Guid.NewGuid(), Name = "Education", Type = CategoryType.Expense, UserId = globalUserId }
        );
    }
}
