using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Transactions;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _transactionService.GetAllAsync(userId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var it = await _transactionService.GetByIdAsync(id, userId);

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
            CategoryId = t.CategoryId,
            Date = t.Date,
            UserId = userId
        };

        await _transactionService.CreateAsync(entity);

        var read = new TransactionReadDto
        {
            Id = entity.Id,
            Description = entity.Description,
            Amount = entity.Amount,
            CategoryId = entity.CategoryId,
            Date = entity.Date,
            UserId = entity.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Transaction>> Put(Guid id, [FromBody] Transaction updated)
    {
        var userId = GetCurrentUserId();
        var existing = await _transactionService.UpdateAsync(id, updated, userId);

        if (existing == null) return NotFound();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        var deleted = await _transactionService.DeleteAsync(id, userId);

        if (!deleted) return NotFound();
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
