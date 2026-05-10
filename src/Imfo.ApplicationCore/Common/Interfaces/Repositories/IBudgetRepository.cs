using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Common.Interfaces.Repositories;

public interface IBudgetRepository
{
    Task<List<Budget>> GetAllForUserAsync(Guid userId);
    Task<Budget?> GetByIdAsync(Guid id, Guid userId);
    Task<Budget> AddAsync(Budget budget, CancellationToken cancellationToken = default);
    Task DeleteAsync(Budget budget, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
