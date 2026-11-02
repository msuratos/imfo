using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces;

namespace Imfo.ApplicationCore.Services.ScheduledTransactions;

public class ScheduledTransactionService : IScheduledTransactionService
{
    private readonly IGenericRepository<ScheduledTransaction> _repository;

    public ScheduledTransactionService(IGenericRepository<ScheduledTransaction> repository)
    {
        _repository = repository;
    }

    public Task<List<ScheduledTransaction>> GetAllAsync(Guid userId, DateTime? from = null, DateTime? to = null)
    {
        var fromDate = from ?? DateTime.MinValue;
        var toDate = to ?? DateTime.MaxValue;

        return _repository.GetAllAsync(
            transaction => transaction.UserId == userId
                && transaction.ReceivedDate >= fromDate
                && transaction.ReceivedDate <= toDate,
            transactions => transactions.OrderByDescending(transaction => transaction.ReceivedDate));
    }

    public Task<ScheduledTransaction?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetFirstOrDefaultAsync(transaction => transaction.Id == id && transaction.UserId == userId);
    }

    public Task<ScheduledTransaction> CreateAsync(ScheduledTransaction scheduledTransaction)
    {
        return _repository.AddAsync(scheduledTransaction);
    }

    public async Task<ScheduledTransaction?> UpdateAsync(Guid id, ScheduledTransaction updated, Guid userId)
    {
        var existing = await _repository.GetFirstOrDefaultAsync(transaction => transaction.Id == id && transaction.UserId == userId);
        if (existing == null) return null;

        existing.Source = updated.Source;
        existing.Amount = updated.Amount;
        existing.Category = updated.Category;
        existing.ReceivedDate = updated.ReceivedDate;
        existing.Frequency = updated.Frequency;

        await _repository.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var existing = await _repository.GetFirstOrDefaultAsync(transaction => transaction.Id == id && transaction.UserId == userId);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
