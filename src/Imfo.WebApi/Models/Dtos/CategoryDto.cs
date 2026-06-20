namespace Imfo.WebApi.Models.Dtos;

public class CategoryCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Income" or "Expense"
}

public class CategoryReadDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
}
