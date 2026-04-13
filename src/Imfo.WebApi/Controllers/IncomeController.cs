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
public class IncomeController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public IncomeController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _db.Incomes.Where(i => i.UserId == userId).OrderByDescending(x => x.ReceivedDate).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Incomes.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();
        return Ok(it);
    }

    [HttpPost]
    public async Task<ActionResult<IncomeReadDto>> Post([FromBody] IncomeCreateDto income)
    {
        var userId = GetCurrentUserId();
        var entity = new Income
        {
            Id = Guid.NewGuid(),
            Source = income.Source,
            Amount = income.Amount,
            ReceivedDate = income.ReceivedDate,
            Frequency = income.Frequency,
            UserId = userId
        };

        _db.Incomes.Add(entity);
        await _db.SaveChangesAsync();

        var read = new IncomeReadDto
        {
            Id = entity.Id,
            Source = entity.Source,
            Amount = entity.Amount,
            ReceivedDate = entity.ReceivedDate,
            Frequency = entity.Frequency,
            UserId = entity.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Income>> Put(Guid id, [FromBody] Income updated)
    {
        var userId = GetCurrentUserId();
        var existing = await _db.Incomes.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (existing == null) return NotFound();

        existing.Source = updated.Source;
        existing.Amount = updated.Amount;
        existing.ReceivedDate = updated.ReceivedDate;
        existing.Frequency = updated.Frequency;

        // UserId remains the authenticated user
        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Incomes.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();
        _db.Incomes.Remove(it);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
