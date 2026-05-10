using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ImfoDbContext _db;

    public CategoryRepository(ImfoDbContext db)
    {
        _db = db;
    }

    public Task<List<Category>> GetAllForUserAsync(Guid userId)
    {
        return _db.Categories
            .Where(c => c.UserId == userId || c.UserId == Guid.Empty)
            .ToListAsync();
    }

    public async Task<Category> AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);
        return category;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
