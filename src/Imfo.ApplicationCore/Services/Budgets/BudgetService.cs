using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces;

namespace Imfo.ApplicationCore.Services.Budgets;

public class BudgetService : IBudgetService
{
    private readonly IGenericRepository<Budget> _repository;

    public BudgetService(IGenericRepository<Budget> repository)
    {
        _repository = repository;
    }

    public Task<List<Budget>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllAsync(budget => budget.UserId == userId);
    }

    public Task<Budget?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetFirstOrDefaultAsync(budget => budget.Id == id && budget.UserId == userId);
    }

    public Task<Budget> CreateAsync(Budget budget)
    {
        return _repository.AddAsync(budget);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var existing = await _repository.GetFirstOrDefaultAsync(budget => budget.Id == id && budget.UserId == userId);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
