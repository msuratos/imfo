using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Goals;
using Imfo.WebApi.Extensions;
using Imfo.WebApi.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GoalController : ControllerBase
{
    private readonly IGoalService _goalService;

    public GoalController(IGoalService goalService)
    {
        _goalService = goalService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GoalReadDto>>> Get()
    {
        var userId = User.GetCurrentUserId();
        var goals = await _goalService.GetAllAsync(userId);
        return Ok(goals.Select(item => new GoalReadDto
        {
            Id = item.Id,
            Category = item.Category,
            Amount = item.Amount,
            Frequency = item.Frequency,
            UserId = item.UserId
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoalReadDto>> Get(Guid id)
    {
        var userId = User.GetCurrentUserId();
        var item = await _goalService.GetByIdAsync(id, userId);

        if (item == null) return NotFound();
        return Ok(new GoalReadDto
        {
            Id = item.Id,
            Category = item.Category,
            Amount = item.Amount,
            Frequency = item.Frequency,
            UserId = item.UserId
        });
    }

    [HttpPost]
    public async Task<ActionResult<GoalReadDto>> Post([FromBody] GoalCreateDto item)
    {
        var userId = User.GetCurrentUserId();
        var entity = new Goal
        {
            Id = Guid.NewGuid(),
            Category = item.Category,
            Amount = item.Amount,
            Frequency = item.Frequency,
            UserId = userId
        };

        await _goalService.CreateAsync(entity);

        var read = new GoalReadDto
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
        var userId = User.GetCurrentUserId();
        var deleted = await _goalService.DeleteAsync(id, userId);

        if (!deleted) return NotFound();

        return NoContent();
    }
}
