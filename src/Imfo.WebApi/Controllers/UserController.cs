using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Users;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser()
    {
        var externalId = User.FindFirst("userId")?.Value;
        if (externalId == null)
        {
            return BadRequest("Invalid external user ID");
        }

        // check if the user already exists
        var existingUser = await _userService.GetUserByExternalIdAsync(externalId);
        if (existingUser != null)
        {
            return Conflict("User already exists");
        }

        var name = User.Identity?.Name;
        if (name == null)
        {
            return BadRequest("Invalid user name");
        }

        var userName = User.FindFirst("preferred_username")?.Value;
        if (userName == null)
        {
            return BadRequest("Invalid user name");
        }

        var user = await _userService.CreateUserAsync(new User
        {
            ExternalId = externalId,
            Name = name,
            UserName = userName
        });

        return Created(nameof(GetUserById), user);
    }
}
