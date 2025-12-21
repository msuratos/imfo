namespace Imfo.WebApi.Models;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // NOTE: plain text for demo only
    // Simple demo token for authentication
    public string? Token { get; set; }

    // EF Core: navigation collections
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<BudgetItem> BudgetItems { get; set; } = new List<BudgetItem>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
