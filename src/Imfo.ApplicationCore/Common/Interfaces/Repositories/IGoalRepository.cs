using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Common.Interfaces.Repositories;

public interface IGoalRepository
{
    Task<List<Goal>> GetAllForUserAsync(Guid userId);
    Task<Goal?> GetByIdAsync(Guid id, Guid userId);
    Task<Goal> AddAsync(Goal goal, CancellationToken cancellationToken = default);
    Task DeleteAsync(Goal goal, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
