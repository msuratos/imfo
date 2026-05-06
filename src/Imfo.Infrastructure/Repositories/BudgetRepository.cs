using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly ImfoDbContext _db;

    public BudgetRepository(ImfoDbContext db)
    {
        _db = db;
    }

    public Task<List<Budget>> GetAllForUserAsync(Guid userId)
    {
        return _db.Budgets.Where(b => b.UserId == userId).ToListAsync();
    }

    public Task<Budget?> GetByIdAsync(Guid id, Guid userId)
    {
        return _db.Budgets.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    }

    public async Task<Budget> AddAsync(Budget budget, CancellationToken cancellationToken = default)
    {
        _db.Budgets.Add(budget);
        await _db.SaveChangesAsync(cancellationToken);
        return budget;
    }

    public Task DeleteAsync(Budget budget, CancellationToken cancellationToken = default)
    {
        _db.Budgets.Remove(budget);
        return _db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
