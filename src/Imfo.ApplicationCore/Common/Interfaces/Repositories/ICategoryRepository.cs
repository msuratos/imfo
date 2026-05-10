using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Common.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllForUserAsync(Guid userId);
    Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
