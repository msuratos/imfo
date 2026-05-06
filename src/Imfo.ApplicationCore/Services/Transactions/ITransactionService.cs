using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Services.Transactions;

public interface ITransactionService
{
    Task<List<Transaction>> GetAllAsync(Guid userId);
    Task<Transaction?> GetByIdAsync(Guid id, Guid userId);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction?> UpdateAsync(Guid id, Transaction updated, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
