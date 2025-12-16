using Imfo.WebApi.Data;
using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Imfo.WebApi.Models.Dtos;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class BudgetController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public BudgetController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetItem>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _db.BudgetItems.Where(b => b.UserId == userId).OrderByDescending(x => x.Date).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetItem>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var item = await _db.BudgetItems.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<BudgetItemReadDto>> Post([FromBody] BudgetItemCreateDto item)
    {
        var userId = GetCurrentUserId();
        var entity = new BudgetItem
        {
            Id = Guid.NewGuid(),
            Title = item.Title,
            Amount = item.Amount,
            Category = item.Category,
            Date = item.Date,
            UserId = userId
        };
        _db.BudgetItems.Add(entity);
        await _db.SaveChangesAsync();
        var read = new BudgetItemReadDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Amount = entity.Amount,
            Category = entity.Category,
            Date = entity.Date,
            UserId = entity.UserId
        };
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.BudgetItems.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (it == null) return NotFound();
        _db.BudgetItems.Remove(it);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
