using Imfo.WebApi.Models;
using Imfo.WebApi.Repositories;
using Imfo.WebApi.Extensions;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetRepository _repo;

    public BudgetsController(IBudgetRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public ActionResult<IEnumerable<object>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? fields = null)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            var pd = new ProblemDetails
            {
                Title = "Invalid pagination parameters",
                Status = StatusCodes.Status400BadRequest,
                Detail = "Ensure 'page' is >= 1 and 'pageSize' is between 1 and 100."
            };
            return BadRequest(pd);
        }

        var all = _repo.GetAll().ToList();
        var totalCount = all.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        if (page > totalPages && totalPages != 0)
        {
            var pd = new ProblemDetails
            {
                Title = "Page out of range",
                Status = StatusCodes.Status404NotFound,
                Detail = "Requested page is greater than total pages available."
            };
            return NotFound(pd);
        }

        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        Response.Headers["X-Pagination"] = JsonSerializer.Serialize(new
        {
            totalCount,
            pageSize,
            currentPage = page,
            totalPages
        });

        if (string.IsNullOrWhiteSpace(fields))
        {
            return Ok(items);
        }

        var fieldList = fields.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var shaped = items.Select(i => i.ShapeData(fieldList)).ToList();
        return Ok(shaped);
    }

    [HttpGet("{id}")]
    public ActionResult<object> Get(Guid id, [FromQuery] string? fields = null)
    {
        var item = _repo.Get(id);
        if (item == null)
        {
            var pd = new ProblemDetails
            {
                Title = "Not found",
                Status = StatusCodes.Status404NotFound,
                Detail = $"Budget item with id '{id}' was not found."
            };
            return NotFound(pd);
        }

        if (string.IsNullOrWhiteSpace(fields)) return Ok(item);

        var fieldList = fields.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var shaped = item.ShapeData(fieldList);
        return Ok(shaped);
    }

    [HttpPost]
    public ActionResult<BudgetItem> Post([FromBody] BudgetItem item)
    {
        if (item == null)
        {
            var pd = new ProblemDetails
            {
                Title = "Bad request",
                Status = StatusCodes.Status400BadRequest,
                Detail = "Request body is empty or malformed."
            };
            return BadRequest(pd);
        }

        var created = _repo.Create(item);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(Guid id)
    {
        if (!_repo.Delete(id))
        {
            var pd = new ProblemDetails
            {
                Title = "Not found",
                Status = StatusCodes.Status404NotFound,
                Detail = $"Budget item with id '{id}' was not found."
            };
            return NotFound(pd);
        }
        return NoContent();
    }
}
