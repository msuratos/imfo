using Imfo.ApplicationCore.Persistance;
using Imfo.ApplicationCore.Persistance.Entities;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/scheduled-transactions")]
public class ScheduledTransactionsController : ControllerBase
{
    private readonly ImfoDbContext _db;

    public ScheduledTransactionsController(ImfoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScheduledTransaction>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _db.ScheduledTransactions.Where(i => i.UserId == userId).OrderByDescending(x => x.ReceivedDate).ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduledTransaction>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _db.ScheduledTransactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();
        return Ok(it);
    }

    [HttpPost]
    public async Task<ActionResult<ScheduledTransactionReadDto>> Post([FromBody] ScheduledTransactionCreateDto income)
    {
        var userId = GetCurrentUserId();
        var st = new ScheduledTransaction
        {
            Id = Guid.NewGuid(),
            Source = income.Source,
            Amount = income.Amount,
            Category = income.Category,
            ReceivedDate = income.ReceivedDate,
            Frequency = income.Frequency,
            UserId = userId
        };

        _db.ScheduledTransactions.Add(st);
        await _db.SaveChangesAsync();

        var readSt = new ScheduledTransactionReadDto
        {
            Id = st.Id,
            Source = st.Source,
            Amount = st.Amount,
            Category = st.Category,
            ReceivedDate = st.ReceivedDate,
            Frequency = st.Frequency,
            UserId = st.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = st.Id }, readSt);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ScheduledTransaction>> Put(Guid id, [FromBody] ScheduledTransaction updated)
    {
        var userId = GetCurrentUserId();
        var existing = await _db.ScheduledTransactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (existing == null) return NotFound();

        existing.Source = updated.Source;
        existing.Amount = updated.Amount;
        existing.Category = updated.Category;
        existing.ReceivedDate = updated.ReceivedDate;
        existing.Frequency = updated.Frequency;

        // UserId remains the authenticated user
        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete (Guid id) 
    {
        var userId = GetCurrentUserId();
        var it = await _db.ScheduledTransactions.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (it == null) return NotFound();
        _db.ScheduledTransactions.Remove(it);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
