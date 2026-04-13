namespace Imfo.WebApi.Models;

public class BudgetItem
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = string.Empty;

    // EF Core: owner user
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
