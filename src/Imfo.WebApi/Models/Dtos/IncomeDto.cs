namespace Imfo.WebApi.Models.Dtos;

public class IncomeCreateDto
{
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string Frequency { get; set; } = string.Empty;
}

public class IncomeReadDto
{
    public Guid Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}
