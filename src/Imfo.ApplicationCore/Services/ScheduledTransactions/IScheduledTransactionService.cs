using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Services.ScheduledTransactions;

public interface IScheduledTransactionService
{
    Task<List<ScheduledTransaction>> GetAllAsync(Guid userId);
    Task<ScheduledTransaction?> GetByIdAsync(Guid id, Guid userId);
    Task<ScheduledTransaction> CreateAsync(ScheduledTransaction scheduledTransaction);
    Task<ScheduledTransaction?> UpdateAsync(Guid id, ScheduledTransaction updated, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
