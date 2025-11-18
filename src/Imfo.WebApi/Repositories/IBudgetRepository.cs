using Budgetor.WebApi.Models;

namespace Budgetor.WebApi.Repositories;

public interface IBudgetRepository
{
    IEnumerable<BudgetItem> GetAll();
    BudgetItem? Get(Guid id);
    BudgetItem Create(BudgetItem item);
    bool Delete(Guid id);
}
