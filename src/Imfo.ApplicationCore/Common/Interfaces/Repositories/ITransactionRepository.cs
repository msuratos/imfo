using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Common.Interfaces.Repositories;

public interface ITransactionRepository
{
    Task<List<Transaction>> GetAllForUserAsync(Guid userId);
    Task<Transaction?> GetByIdAsync(Guid id, Guid userId);
    Task<Transaction> AddAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task DeleteAsync(Transaction transaction, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
