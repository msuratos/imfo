using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class GoalRepository : IGoalRepository
{
    private readonly ImfoDbContext _db;

    public GoalRepository(ImfoDbContext db)
    {
        _db = db;
    }

    public Task<List<Goal>> GetAllForUserAsync(Guid userId)
    {
        return _db.Set<Goal>().Where(g => g.UserId == userId).ToListAsync();
    }

    public Task<Goal?> GetByIdAsync(Guid id, Guid userId)
    {
        return _db.Set<Goal>().FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
    }

    public async Task<Goal> AddAsync(Goal goal, CancellationToken cancellationToken = default)
    {
        _db.Set<Goal>().Add(goal);
        await _db.SaveChangesAsync(cancellationToken);
        return goal;
    }

    public Task DeleteAsync(Goal goal, CancellationToken cancellationToken = default)
    {
        _db.Set<Goal>().Remove(goal);
        return _db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
