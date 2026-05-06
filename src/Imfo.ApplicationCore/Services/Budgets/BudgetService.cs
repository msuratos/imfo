using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;

namespace Imfo.ApplicationCore.Services.Budgets;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _repository;

    public BudgetService(IBudgetRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Budget>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllForUserAsync(userId);
    }

    public Task<Budget?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetByIdAsync(id, userId);
    }

    public Task<Budget> CreateAsync(Budget budget)
    {
        return _repository.AddAsync(budget);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var existing = await _repository.GetByIdAsync(id, userId);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
