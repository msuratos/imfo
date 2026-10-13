using System.Linq.Expressions;
using Imfo.ApplicationCore.Common.Interfaces;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
{
    private readonly ImfoDbContext _db;

    public GenericRepository(ImfoDbContext db)
    {
        _db = db;
    }

    public Task<List<TEntity>> GetAllAsync(
        Expression<Func<TEntity, bool>> predicate,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null)
    {
        IQueryable<TEntity> query = _db.Set<TEntity>().Where(predicate);
        if (orderBy != null)
        {
            query = orderBy(query);
        }

        return query.ToListAsync();
    }

    public Task<TEntity?> GetFirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return _db.Set<TEntity>().FirstOrDefaultAsync(predicate);
    }

    public async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await _db.Set<TEntity>().AddAsync(entity, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public Task DeleteAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        _db.Set<TEntity>().Remove(entity);
        return _db.SaveChangesAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}