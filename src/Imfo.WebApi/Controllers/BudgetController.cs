using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private static readonly List<BudgetItem> _items = new();

    static BudgetController()
    {
        _items.Add(new BudgetItem { Id = Guid.NewGuid(), Title = "Salary", Amount = 5000, Category = "Income", Date = DateTime.UtcNow });
        _items.Add(new BudgetItem { Id = Guid.NewGuid(), Title = "Rent", Amount = -1200, Category = "Housing", Date = DateTime.UtcNow });
        _items.Add(new BudgetItem { Id = Guid.NewGuid(), Title = "Groceries", Amount = -300, Category = "Food", Date = DateTime.UtcNow });
    }

    [HttpGet]
    public ActionResult<IEnumerable<BudgetItem>> Get()
    {
        return Ok(_items.OrderByDescending(x => x.Date));
    }

    [HttpGet("{id}")]
    public ActionResult<BudgetItem> Get(Guid id)
    {
        var item = _items.FirstOrDefault(x => x.Id == id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public ActionResult<BudgetItem> Post([FromBody] BudgetItem item)
    {
        item.Id = Guid.NewGuid();
        _items.Add(item);
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(Guid id)
    {
        var it = _items.FirstOrDefault(x => x.Id == id);
        if (it == null) return NotFound();
        _items.Remove(it);
        return NoContent();
    }
}
