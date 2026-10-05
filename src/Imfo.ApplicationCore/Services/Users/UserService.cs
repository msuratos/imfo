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
        // check request parameters
        if (string.IsNullOrEmpty(request.ExternalId)) throw new ArgumentException("ExternalId is required", nameof(request.ExternalId));
        if (string.IsNullOrEmpty(request.UserName)) throw new ArgumentException("UserName is required", nameof(request.UserName));
        if (string.IsNullOrEmpty(request.Name)) throw new ArgumentException("Name is required", nameof(request.Name));

        // check if the user already exists
        var existingUser = await this.GetUserByExternalIdAsync(request.ExternalId);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User already exists");
        }

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