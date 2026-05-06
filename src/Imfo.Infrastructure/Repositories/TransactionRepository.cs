using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly ImfoDbContext _db;

    public TransactionRepository(ImfoDbContext db)
    {
        _db = db;
    }

    public Task<List<Transaction>> GetAllForUserAsync(Guid userId)
    {
        return _db.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public Task<Transaction?> GetByIdAsync(Guid id, Guid userId)
    {
        return _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
    }

    public async Task<Transaction> AddAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync(cancellationToken);
        return transaction;
    }

    public Task DeleteAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        _db.Transactions.Remove(transaction);
        return _db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
