using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;

namespace Imfo.ApplicationCore.Services.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User?> GetUserByExternalIdAsync(string externalId)
    {
        return await _userRepository.GetByExternalIdAsync(externalId);
    }

    public async Task<User> CreateUserAsync(User request)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            ExternalId = request.ExternalId,
            Name = request.Name,
            UserName = request.UserName
        };

        await _userRepository.AddAsync(user);
        return user;
    }
}