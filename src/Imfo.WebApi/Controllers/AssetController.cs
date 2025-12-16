using Imfo.WebApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssetController : ControllerBase
{
    private static readonly List<Asset> _items = new();

    static AssetController()
    {
        _items.Add(new Asset { Id = Guid.NewGuid(), Name = "Laptop", Value = 1200m, Type = "Electronics", AcquiredDate = DateTime.UtcNow });
        _items.Add(new Asset { Id = Guid.NewGuid(), Name = "Bike", Value = 300m, Type = "Transport", AcquiredDate = DateTime.UtcNow });
    }

    [HttpGet]
    public ActionResult<IEnumerable<Asset>> Get() => Ok(_items.OrderByDescending(x => x.AcquiredDate));

    [HttpGet("{id}")]
    public ActionResult<Asset> Get(Guid id)
    {
        var it = _items.FirstOrDefault(x => x.Id == id);
        if (it == null) return NotFound();
        return Ok(it);
    }

    [HttpPost]
    public ActionResult<Asset> Post([FromBody] Asset a)
    {
        a.Id = Guid.NewGuid();
        _items.Add(a);
        return CreatedAtAction(nameof(Get), new { id = a.Id }, a);
    }

    [HttpPut("{id}")]
    public ActionResult<Asset> Put(Guid id, [FromBody] Asset updated)
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
