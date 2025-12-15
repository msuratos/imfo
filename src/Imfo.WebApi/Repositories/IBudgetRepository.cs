using Imfo.WebApi.Models;

namespace Imfo.WebApi.Repositories;

public interface IBudgetRepository
{
    IEnumerable<BudgetItem> GetAll();
    BudgetItem? Get(Guid id);
    BudgetItem Create(BudgetItem item);
    bool Delete(Guid id);
}
