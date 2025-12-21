using Imfo.WebApi.Data;
using Imfo.WebApi.Models;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ImfoDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(ImfoDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }


    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserReadDto>> Register([FromBody] UserCreateDto u)
    {
        if (await _db.Users.AnyAsync(x => x.Username == u.Username)) return Conflict("User already exists");

        var entity = new User { Id = Guid.NewGuid(), Username = u.Username, Password = u.Password };
        _db.Users.Add(entity);
        await _db.SaveChangesAsync();

        var read = new UserReadDto { Id = entity.Id, Username = entity.Username };
        return CreatedAtAction(nameof(GetUser), new { id = entity.Id }, read);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] UserCreateDto credentials)
    {
        var found = await _db.Users.FirstOrDefaultAsync(x => x.Username == credentials.Username && x.Password == credentials.Password);
        if (found == null) return Unauthorized();

        var jwtKey = _config["Jwt:Key"] ?? throw new Exception("Failed to get JWT signing key.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, found.Id.ToString()),
            new Claim(ClaimTypes.Name, found.Username)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        // (optional) persist token for demo compatibility
        found.Token = tokenString;
        await _db.SaveChangesAsync();

        return Ok(new { token = tokenString, user = found.Username });
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
