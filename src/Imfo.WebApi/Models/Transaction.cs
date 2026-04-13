namespace Imfo.WebApi.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; } // Positive = Expense, Negative = Income
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }

    // EF Core: owner user
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
