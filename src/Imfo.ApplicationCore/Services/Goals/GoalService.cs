using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces;

namespace Imfo.ApplicationCore.Services.Goals;

public class GoalService : IGoalService
{
    private readonly IGenericRepository<Goal> _repository;

    public GoalService(IGenericRepository<Goal> repository)
    {
        _repository = repository;
    }

    public Task<List<Goal>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllAsync(goal => goal.UserId == userId);
    }

    public Task<Goal?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetFirstOrDefaultAsync(goal => goal.Id == id && goal.UserId == userId);
    }

    public Task<Goal> CreateAsync(Goal goal)
    {
        return _repository.AddAsync(goal);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var existing = await _repository.GetFirstOrDefaultAsync(goal => goal.Id == id && goal.UserId == userId);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
