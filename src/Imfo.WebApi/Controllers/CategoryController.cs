using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Categories;
using Imfo.WebApi.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryReadDto>>> Get()
    {
        var userId = GetCurrentUserId();
        var categories = await _categoryService.GetAllAsync(userId);

        return Ok(categories.Select(c => new CategoryReadDto
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type.ToString(),
            UserId = c.UserId
        }));
    }

    [HttpPost]
    public async Task<ActionResult<CategoryReadDto>> Post([FromBody] CategoryCreateDto dto)
    {
        var userId = GetCurrentUserId();

        if (!Enum.TryParse<CategoryType>(dto.Type, true, out var type))
        {
            return BadRequest("Invalid category type");
        }

        var entity = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Type = type,
            UserId = userId
        };

        await _categoryService.CreateAsync(entity);

        var read = new CategoryReadDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = entity.Type.ToString(),
            UserId = entity.UserId
        };

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, read);
    }

    private Guid GetCurrentUserId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idClaim, out var id) ? id : Guid.Empty;
    }
}
