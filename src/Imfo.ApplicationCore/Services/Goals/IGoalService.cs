using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Services.Goals;

public interface IGoalService
{
    Task<List<Goal>> GetAllAsync(Guid userId);
    Task<Goal?> GetByIdAsync(Guid id, Guid userId);
    Task<Goal> CreateAsync(Goal goal);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
