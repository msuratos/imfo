namespace Imfo.WebApi.Models.Dtos;

public class BudgetItemCreateDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = string.Empty;
}

public class BudgetItemReadDto
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
