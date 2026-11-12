namespace Imfo.ApplicationCore.Services.Forecasting;

public enum ForecastMethod
{
    Average,
    Linear
}

public interface IForecastService
{
    Task<ForecastResult> GetForecastAsync(
        Guid userId,
        int months,
        ForecastMethod method,
        CancellationToken cancellationToken);
}
