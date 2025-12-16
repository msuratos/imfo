using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private static readonly List<User> _users = new();

    [HttpPost("register")]
    public ActionResult<User> Register([FromBody] User u)
    {
        if (_users.Any(x => x.Username == u.Username)) return Conflict("User already exists");
        u.Id = Guid.NewGuid();
        _users.Add(u);
        return CreatedAtAction(nameof(GetUser), new { id = u.Id }, u);
    }

    [HttpPost("login")]
    public ActionResult Login([FromBody] User credentials)
    {
        var found = _users.FirstOrDefault(x => x.Username == credentials.Username && x.Password == credentials.Password);
        if (found == null) return Unauthorized();
        // return a simple placeholder token for demo
        return Ok(new { token = "demo-token", user = found.Username });
    }

    [HttpGet("{id}")]
    public ActionResult<User> GetUser(Guid id)
    {
        var it = _users.FirstOrDefault(x => x.Id == id);
        if (it == null) return NotFound();
        return Ok(it);
    }
}
