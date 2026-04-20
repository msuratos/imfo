using Imfo.ApplicationCore.Common.Entities;
using Imfo.Infrastructure.Persistance;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public CategoryController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryReadDto>>> Get()
    {
        var userId = GetCurrentUserId();
        // return categories belonging to the user plus global categories (UserId == Guid.Empty)
        var cats = await _db.Categories
            .Where(c => c.UserId == userId || c.UserId == Guid.Empty)
            .Select(c => new CategoryReadDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type.ToString(),
                UserId = c.UserId
            })
            .ToListAsync();

        return Ok(cats);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryReadDto>> Post([FromBody] CategoryCreateDto dto)
    {
        var userId = GetCurrentUserId();

        if (!Enum.TryParse<CategoryType>(dto.Type, true, out var type))
        {
            return BadRequest("Invalid category type");
        }

        var entity = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Type = type,
            UserId = userId
        };

        _db.Categories.Add(entity);
        await _db.SaveChangesAsync();

        var read = new CategoryReadDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = entity.Type.ToString(),
            UserId = entity.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
