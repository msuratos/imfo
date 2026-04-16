namespace Imfo.ApplicationCore.Persistance.Entities;

public class ScheduledTransaction
{
    public Guid Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string Frequency { get; set; } = string.Empty; // e.g., "One-time", "Monthly", "Quarterly"

    // EF Core: owner user
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
