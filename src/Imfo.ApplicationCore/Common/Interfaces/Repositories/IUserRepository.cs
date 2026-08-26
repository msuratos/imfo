using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Common.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByExternalIdAsync(string externalId);
    Task AddAsync(User user);
}