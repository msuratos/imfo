using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Services.Users;

public interface IUserService
{
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByExternalIdAsync(string externalId);
    Task<User> CreateUserAsync(User request);
}