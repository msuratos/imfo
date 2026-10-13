using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces;

namespace Imfo.ApplicationCore.Services.Transactions;

public class TransactionService : ITransactionService
{
    private readonly IGenericRepository<Transaction> _repository;

    public TransactionService(IGenericRepository<Transaction> repository)
    {
        _repository = repository;
    }

    public Task<List<Transaction>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllAsync(
            transaction => transaction.UserId == userId,
            transactions => transactions.OrderByDescending(transaction => transaction.Date));
    }

    public Task<Transaction?> GetByIdAsync(Guid id, Guid userId)
    {
        return _repository.GetFirstOrDefaultAsync(transaction => transaction.Id == id && transaction.UserId == userId);
    }

    public Task<Transaction> CreateAsync(Transaction transaction)
    {
        return _repository.AddAsync(transaction);
    }

    public async Task<Transaction?> UpdateAsync(Guid id, Transaction updated, Guid userId)
    {
        var existing = await _repository.GetFirstOrDefaultAsync(transaction => transaction.Id == id && transaction.UserId == userId);
        if (existing == null) return null;

        existing.Description = updated.Description;
        existing.Amount = updated.Amount;
        existing.CategoryId = updated.CategoryId;
        existing.Date = updated.Date;

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
