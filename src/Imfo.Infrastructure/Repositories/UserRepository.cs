using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;
using Imfo.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Imfo.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ImfoDbContext _dbContext;

    public UserRepository(ImfoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Users.FindAsync(id);
    }

    public async Task<User?> GetByExternalIdAsync(string externalId)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.ExternalId == externalId);
    }

    public async Task AddAsync(User user)
    {
        await _dbContext.Users.AddAsync(user);
        await _dbContext.SaveChangesAsync();
    }
}