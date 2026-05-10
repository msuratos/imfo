using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Services.Budgets;

public interface IBudgetService
{
    Task<List<Budget>> GetAllAsync(Guid userId);
    Task<Budget?> GetByIdAsync(Guid id, Guid userId);
    Task<Budget> CreateAsync(Budget budget);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
