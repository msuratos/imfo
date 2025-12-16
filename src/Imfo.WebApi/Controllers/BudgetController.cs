using Imfo.WebApi.Models;
using Imfo.WebApi.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly IBudgetRepository _repo;

    public BudgetController(IBudgetRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public ActionResult<IEnumerable<BudgetItem>> Get()
    {
        return Ok(_repo.GetAll());
    }

    [HttpGet("{id}")]
    public ActionResult<BudgetItem> Get(Guid id)
    {
        var item = _repo.Get(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public ActionResult<BudgetItem> Post([FromBody] BudgetItem item)
    {
        var created = _repo.Create(item);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(Guid id)
    {
        if (!_repo.Delete(id)) return NotFound();
        return NoContent();
    }
}
