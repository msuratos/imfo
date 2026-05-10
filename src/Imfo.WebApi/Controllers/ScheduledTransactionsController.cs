using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.ScheduledTransactions;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/scheduled-transactions")]
public class ScheduledTransactionsController : ControllerBase
{
    private readonly IScheduledTransactionService _scheduledTransactionService;

    public ScheduledTransactionsController(IScheduledTransactionService scheduledTransactionService)
    {
        _scheduledTransactionService = scheduledTransactionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScheduledTransaction>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _scheduledTransactionService.GetAllAsync(userId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduledTransaction>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _scheduledTransactionService.GetByIdAsync(id, userId);

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

        await _scheduledTransactionService.CreateAsync(st);

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
        var existing = await _scheduledTransactionService.UpdateAsync(id, updated, userId);

        if (existing == null) return NotFound();

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete (Guid id) 
    {
        var userId = GetCurrentUserId();
        var deleted = await _scheduledTransactionService.DeleteAsync(id, userId);

        if (!deleted) return NotFound();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
