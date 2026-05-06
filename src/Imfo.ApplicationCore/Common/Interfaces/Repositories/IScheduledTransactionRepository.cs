using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Common.Interfaces.Repositories;

public interface IScheduledTransactionRepository
{
    Task<List<ScheduledTransaction>> GetAllForUserAsync(Guid userId);
    Task<ScheduledTransaction?> GetByIdAsync(Guid id, Guid userId);
    Task<ScheduledTransaction> AddAsync(ScheduledTransaction scheduledTransaction, CancellationToken cancellationToken = default);
    Task DeleteAsync(ScheduledTransaction scheduledTransaction, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
