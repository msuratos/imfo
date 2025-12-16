using Imfo.WebApi.Data;
using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Imfo.WebApi.Models.Dtos;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class TransactionController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public TransactionController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _db.Transactions.Where(t => t.UserId == userId).OrderByDescending(x => x.Date).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (it == null) return NotFound();
        return Ok(it);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionReadDto>> Post([FromBody] TransactionCreateDto t)
    {
        var userId = GetCurrentUserId();
        var entity = new Transaction
        {
            Id = Guid.NewGuid(),
            Description = t.Description,
            Amount = t.Amount,
            Category = t.Category,
            Date = t.Date,
            UserId = userId
        };
        _db.Transactions.Add(entity);
        await _db.SaveChangesAsync();
        var read = new TransactionReadDto
        {
            Id = entity.Id,
            Description = entity.Description,
            Amount = entity.Amount,
            Category = entity.Category,
            Date = entity.Date,
            UserId = entity.UserId
        };
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Transaction>> Put(Guid id, [FromBody] Transaction updated)
    {
        var userId = GetCurrentUserId();
        var existing = await _db.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (existing == null) return NotFound();
        existing.Description = updated.Description;
        existing.Amount = updated.Amount;
        existing.Category = updated.Category;
        existing.Date = updated.Date;
        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.Transactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (it == null) return NotFound();
        _db.Transactions.Remove(it);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
