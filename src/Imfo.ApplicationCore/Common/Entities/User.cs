namespace Imfo.ApplicationCore.Common.Entities;

public class User
{
    public Guid Id { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    public ICollection<Budget> Budgets { get; set; } = new HashSet<Budget>();
    public ICollection<Category> Categories { get; set; } = new HashSet<Category>();
    public ICollection<Goal> Goals { get; set; } = new HashSet<Goal>();
    public ICollection<ScheduledTransaction> ScheduledTransactions { get; set; } = new HashSet<ScheduledTransaction>();
    public ICollection<Transaction> Transactions { get; set; } = new HashSet<Transaction>();
}
