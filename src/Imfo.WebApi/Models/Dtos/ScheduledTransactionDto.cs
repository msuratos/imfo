namespace Imfo.WebApi.Models.Dtos;

public class ScheduledTransactionCreateDto
{
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string Frequency { get; set; } = string.Empty;
}

public class ScheduledTransactionReadDto
{
    public Guid Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Category { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
