using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Goals;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
    public async Task<ActionResult<IEnumerable<Goal>>> Get()
    {
        var userId = GetCurrentUserId();
        return Ok(await _goalService.GetAllAsync(userId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Goal>> Get(Guid id)
    {
        var userId = GetCurrentUserId();
        var item = await _goalService.GetByIdAsync(id, userId);

        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<GoalReadDto>> Post([FromBody] GoalCreateDto item)
    {
        var userId = GetCurrentUserId();
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
        var userId = GetCurrentUserId();
        var deleted = await _goalService.DeleteAsync(id, userId);

        if (!deleted) return NotFound();

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
