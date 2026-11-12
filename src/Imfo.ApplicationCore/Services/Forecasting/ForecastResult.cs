namespace Imfo.ApplicationCore.Services.Forecasting;

/// <summary>Contains the projected monthly balances and the leading categories.</summary>
public sealed record ForecastResult(
    IReadOnlyList<ForecastMonth> Buckets,
    IReadOnlyList<ForecastCategory> TopCategories);

/// <summary>Represents one month in the balance forecast.</summary>
public sealed record ForecastMonth(
    string Date,
    decimal Balance,
    decimal Income,
    decimal Expenses);

/// <summary>Represents a category's projected amount for the first forecast month.</summary>
public sealed record ForecastCategory(
    string Name,
    decimal Amount);
