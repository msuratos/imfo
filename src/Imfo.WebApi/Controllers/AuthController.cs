using Imfo.WebApi.Data;
using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public AuthController(ImfoDbContext db)
    {
        _db = db;
    }


    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<Models.Dtos.UserReadDto>> Register([FromBody] Models.Dtos.UserCreateDto u)
    {
        if (await _db.Users.AnyAsync(x => x.Username == u.Username)) return Conflict("User already exists");
        var entity = new User { Id = Guid.NewGuid(), Username = u.Username, Password = u.Password };
        _db.Users.Add(entity);
        await _db.SaveChangesAsync();
        var read = new Models.Dtos.UserReadDto { Id = entity.Id, Username = entity.Username };
        return CreatedAtAction(nameof(GetUser), new { id = entity.Id }, read);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] Models.Dtos.UserCreateDto credentials)
    {
        var found = await _db.Users.FirstOrDefaultAsync(x => x.Username == credentials.Username && x.Password == credentials.Password);
        if (found == null) return Unauthorized();
        // generate a simple token and store it on the user for demo purposes
        found.Token = Guid.NewGuid().ToString();
        await _db.SaveChangesAsync();
        return Ok(new { token = found.Token, user = found.Username });
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult> GetUser(Guid id)
    {
        var it = await _db.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (it == null) return NotFound();
        return Ok(new { Id = it.Id, Username = it.Username });
    }
}
