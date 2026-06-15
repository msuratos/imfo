using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;

namespace Imfo.ApplicationCore.Services.Goals;

public class GoalService : IGoalService
{
    private readonly IGoalRepository _repository;

    public GoalService(IGoalRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Goal>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllForUserAsync(userId);
    }

    public Task<Goal?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetByIdAsync(id, userId);
    }

    public Task<Goal> CreateAsync(Goal goal)
    {
        return _repository.AddAsync(goal);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var existing = await _repository.GetByIdAsync(id, userId);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
