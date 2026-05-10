using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class ScheduledTransactionRepository : IScheduledTransactionRepository
{
    private readonly ImfoDbContext _db;

    public ScheduledTransactionRepository(ImfoDbContext db)
    {
        _db = db;
    }

    public Task<List<ScheduledTransaction>> GetAllForUserAsync(Guid userId)
    {
        return _db.ScheduledTransactions
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.ReceivedDate)
            .ToListAsync();
    }

    public Task<ScheduledTransaction?> GetByIdAsync(Guid id, Guid userId)
    {
        return _db.ScheduledTransactions.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);
    }

    public async Task<ScheduledTransaction> AddAsync(ScheduledTransaction scheduledTransaction, CancellationToken cancellationToken = default)
    {
        _db.ScheduledTransactions.Add(scheduledTransaction);
        await _db.SaveChangesAsync(cancellationToken);
        return scheduledTransaction;
    }

    public Task DeleteAsync(ScheduledTransaction scheduledTransaction, CancellationToken cancellationToken = default)
    {
        _db.ScheduledTransactions.Remove(scheduledTransaction);
        return _db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
