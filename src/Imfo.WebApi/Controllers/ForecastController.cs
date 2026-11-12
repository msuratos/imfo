using Imfo.ApplicationCore.Services.Forecasting;
using Imfo.WebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/forecast")]
public class ForecastController : ControllerBase
{
    private readonly IForecastService _forecastService;

    public ForecastController(IForecastService forecastService)
    {
        _forecastService = forecastService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ForecastResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ForecastResult>> Get(
        [FromQuery] int months = 12,
        [FromQuery] string? method = "average",
        CancellationToken cancellationToken = default)
    {
        if (months is not (3 or 6 or 12))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid forecast horizon",
                Detail = "Months must be 3, 6, or 12."
            });
        }

        var forecastMethod = method?.ToLowerInvariant() switch
        {
            "average" => ForecastMethod.Average,
            "linear" => ForecastMethod.Linear,
            _ => (ForecastMethod?)null
        };
        if (forecastMethod is null)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid forecast method",
                Detail = "Method must be 'average' or 'linear'."
            });
        }

        var result = await _forecastService.GetForecastAsync(
            User.GetCurrentUserId(),
            months,
            forecastMethod.Value,
            cancellationToken);

        return Ok(result);
    }
}
