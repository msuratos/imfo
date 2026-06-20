using Microsoft.EntityFrameworkCore;
using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.Infrastructure.Persistance;

public class ImfoDbContext : DbContext
{
    public ImfoDbContext(DbContextOptions<ImfoDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<ScheduledTransaction> ScheduledTransactions { get; set; } = null!;
    public DbSet<Budget> Budgets { get; set; } = null!;
    public DbSet<Goal> Goals { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ImfoDbContext).Assembly);

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
