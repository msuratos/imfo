using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;

namespace Imfo.ApplicationCore.Services.ScheduledTransactions;

public class ScheduledTransactionService : IScheduledTransactionService
{
    private readonly IScheduledTransactionRepository _repository;

    public ScheduledTransactionService(IScheduledTransactionRepository repository)
    {
        _repository = repository;
    }

    public Task<List<ScheduledTransaction>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllForUserAsync(userId);
    }

    public Task<ScheduledTransaction?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetByIdAsync(id, userId);
    }

    public Task<ScheduledTransaction> CreateAsync(ScheduledTransaction scheduledTransaction)
    {
        return _repository.AddAsync(scheduledTransaction);
    }

    public async Task<ScheduledTransaction?> UpdateAsync(Guid id, ScheduledTransaction updated, Guid userId)
    {
        var existing = await _repository.GetByIdAsync(id, userId);
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
        var existing = await _repository.GetByIdAsync(id, userId);
        if (existing == null) return false;

        await _repository.DeleteAsync(existing);
        return true;
    }
}
