using System.Security.Claims;
using Imfo.WebApi.Data;
using Imfo.WebApi.Models;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AssetController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public AssetController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asset>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _db.Assets.Where(a => a.UserId == userId).OrderByDescending(x => x.AcquiredDate).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Asset>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Assets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();
        return Ok(it);
    }

    [HttpPost]
    public async Task<ActionResult<AssetReadDto>> Post([FromBody] AssetCreateDto a)
    {
        var userId = GetCurrentUserId();
        var entity = new Asset
        {
            Id = Guid.NewGuid(),
            Name = a.Name,
            Value = a.Value,
            Type = a.Type,
            AcquiredDate = a.AcquiredDate,
            UserId = userId
        };

        _db.Assets.Add(entity);
        await _db.SaveChangesAsync();

        var read = new AssetReadDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Value = entity.Value,
            Type = entity.Type,
            AcquiredDate = entity.AcquiredDate,
            UserId = entity.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Asset>> Put(Guid id, [FromBody] Asset updated)
    {
        var userId = GetCurrentUserId();
        var existing = await _db.Assets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (existing == null) return NotFound();

        existing.Name = updated.Name;
        existing.Value = updated.Value;
        existing.Type = updated.Type;
        existing.AcquiredDate = updated.AcquiredDate;

        // UserId remains the authenticated user
        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Assets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();
        _db.Assets.Remove(it);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
