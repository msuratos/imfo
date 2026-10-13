using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Budgets;
using Imfo.WebApi.Extensions;
using Imfo.WebApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<ActionResult<IEnumerable<BudgetReadDto>>> Get()
    {
        var userId = User.GetCurrentUserId();
        var budgets = await _budgetService.GetAllAsync(userId);
        return Ok(budgets.Select(item => new BudgetReadDto
        {
            Id = item.Id,
            Category = item.Category,
            Amount = item.Amount,
            Frequency = item.Frequency,
            UserId = item.UserId
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetReadDto>> Get(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var item = await _budgetService.GetByIdAsync(id, userId);

        if (item == null) return NotFound();
        return Ok(new BudgetReadDto
        {
            Id = item.Id,
            Category = item.Category,
            Amount = item.Amount,
            Frequency = item.Frequency,
            UserId = item.UserId
        });
    }

    [HttpPost]
    public async Task<ActionResult<BudgetReadDto>> Post([FromBody] BudgetCreateDto item)
    {
        var userId = User.GetCurrentUserId();
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

        return Created(nameof(Post), read);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var deleted = await _budgetService.DeleteAsync(id, userId);

        if (!deleted) return NotFound();

        return NoContent();
    }
}
