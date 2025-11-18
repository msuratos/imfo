using Budgetor.WebApi.Models;

namespace Budgetor.WebApi.Repositories;

public class InMemoryBudgetRepository : IBudgetRepository
{
    private readonly List<BudgetItem> _items = new();

    public InMemoryBudgetRepository()
    {
        // seed
        _items.Add(new BudgetItem { Id = Guid.NewGuid(), Title = "Salary", Amount = 5000, Category = "Income", Date = DateTime.UtcNow });
        _items.Add(new BudgetItem { Id = Guid.NewGuid(), Title = "Rent", Amount = -1200, Category = "Housing", Date = DateTime.UtcNow });
        _items.Add(new BudgetItem { Id = Guid.NewGuid(), Title = "Groceries", Amount = -300, Category = "Food", Date = DateTime.UtcNow });
    }

    public BudgetItem Create(BudgetItem item)
    {
        item.Id = Guid.NewGuid();
        _items.Add(item);
        return item;
    }

    public bool Delete(Guid id)
    {
        var it = _items.FirstOrDefault(x => x.Id == id);
        if (it == null) return false;
        _items.Remove(it);
        return true;
    }

    public BudgetItem? Get(Guid id) => _items.FirstOrDefault(x => x.Id == id);

    public IEnumerable<BudgetItem> GetAll() => _items.OrderByDescending(x => x.Date);
}
