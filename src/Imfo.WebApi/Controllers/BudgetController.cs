using Imfo.WebApi.Data;
using Imfo.WebApi.Models;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public BudgetController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Budget>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _db.Budgets.Where(b => b.UserId == userId).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Budget>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var item = await _db.Budgets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<BudgetReadDto>> Post([FromBody] BudgetCreateDto item)
    {
        var userId = GetCurrentUserId();
        var entity = new Budget
        {
            Id = Guid.NewGuid(),
            Category = item.Category,
            Amount = item.Amount,
            Frequency = item.Frequency,
            UserId = userId
        };

        _db.Budgets.Add(entity);
        await _db.SaveChangesAsync();

        var read = new BudgetReadDto
        {
            Id = entity.Id,
            Category = entity.Category,
            Amount = entity.Amount,
            Frequency = entity.Frequency,
            UserId = entity.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Budgets.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();

        _db.Budgets.Remove(it);
        await _db.SaveChangesAsync();
        
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
