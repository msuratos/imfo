using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private static readonly List<Transaction> _items = new();

    static TransactionController()
    {
        _items.Add(new Transaction { Id = Guid.NewGuid(), Description = "Invoice #1", Amount = 150.00m, Category = "Income", Date = DateTime.UtcNow });
        _items.Add(new Transaction { Id = Guid.NewGuid(), Description = "Coffee", Amount = -3.50m, Category = "Food", Date = DateTime.UtcNow });
    }

    [HttpGet]
    public ActionResult<IEnumerable<Transaction>> Get() => Ok(_items.OrderByDescending(x => x.Date));

    [HttpGet("{id}")]
    public ActionResult<Transaction> Get(Guid id)
    {
        var it = _items.FirstOrDefault(x => x.Id == id);
        if (it == null) return NotFound();
        return Ok(it);
    }

    [HttpPost]
    public ActionResult<Transaction> Post([FromBody] Transaction t)
    {
        t.Id = Guid.NewGuid();
        _items.Add(t);
        return CreatedAtAction(nameof(Get), new { id = t.Id }, t);
    }

    [HttpPut("{id}")]
    public ActionResult<Transaction> Put(Guid id, [FromBody] Transaction updated)
    {
        var idx = _items.FindIndex(x => x.Id == id);
        if (idx == -1) return NotFound();
        updated.Id = id;
        _items[idx] = updated;
        return Ok(updated);
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
