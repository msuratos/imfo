namespace Imfo.WebApi.Models;

public enum CategoryType
{
    Income,
    Expense
}

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }

    // EF Core: owner user
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
