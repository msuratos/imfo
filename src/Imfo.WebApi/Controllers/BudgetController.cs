using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Budgets;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Budget>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _budgetService.GetAllAsync(userId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Budget>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var item = await _budgetService.GetByIdAsync(id, userId);

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

        await _budgetService.CreateAsync(entity);

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
        var deleted = await _budgetService.DeleteAsync(id, userId);

        if (!deleted) return NotFound();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
