namespace Imfo.WebApi.Models.Dtos;

public class TransactionCreateDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; } // Positive = Expense, Negative = Income
    public Guid CategoryId { get; set; }
    public DateTime Date { get; set; }
    
}

public class TransactionReadDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; } // Positive = Expense, Negative = Income
    public Guid CategoryId { get; set; }
    public DateTime Date { get; set; }
    public Guid UserId { get; set; }
}
