using System.Globalization;
using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Services.Categories;
using Imfo.ApplicationCore.Services.ScheduledTransactions;
using Imfo.ApplicationCore.Services.Transactions;

namespace Imfo.ApplicationCore.Services.Forecasting;

public sealed class ForecastService : IForecastService
{
    private const int HistoryMonths = 12;

    private readonly ITransactionService _transactionService;
    private readonly IScheduledTransactionService _scheduledTransactionService;
    private readonly ICategoryService _categoryService;

    public ForecastService(
        ITransactionService transactionService,
        IScheduledTransactionService scheduledTransactionService,
        ICategoryService categoryService)
    {
        _transactionService = transactionService;
        _scheduledTransactionService = scheduledTransactionService;
        _categoryService = categoryService;
    }

    public async Task<ForecastResult> GetForecastAsync(
        Guid userId,
        int months,
        ForecastMethod method,
        CancellationToken cancellationToken)
    {
        var transactions = await _transactionService.GetAllAsync(userId, cancellationToken: cancellationToken);
        var scheduledTransactions = await _scheduledTransactionService.GetAllAsync(userId, cancellationToken: cancellationToken);
        var categories = await _categoryService.GetAllAsync(userId, cancellationToken);

        var now = DateTime.UtcNow;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var currentDay = DateOnly.FromDateTime(now);
        var balance = transactions
            .Where(transaction => transaction.Date < currentMonthStart)
            .Sum(transaction => transaction.Amount);

        var monthlyHistory = new List<MonthlyHistory>(HistoryMonths);
        for (var monthOffset = HistoryMonths; monthOffset > 0; monthOffset--)
        {
            var monthStart = currentMonthStart.AddMonths(-monthOffset);
            var monthEnd = monthStart.AddMonths(1);
            var monthTransactions = transactions
                .Where(transaction => transaction.Date >= monthStart && transaction.Date < monthEnd)
                .ToList();
            var byCategory = monthTransactions
                .GroupBy(transaction => transaction.CategoryId.ToString())
                .ToDictionary(group => group.Key, group => group.Sum(transaction => transaction.Amount));

            monthlyHistory.Add(new MonthlyHistory(
                monthTransactions.Where(transaction => transaction.Amount > 0).Sum(transaction => transaction.Amount),
                monthTransactions.Where(transaction => transaction.Amount < 0).Sum(transaction => Math.Abs(transaction.Amount)),
                byCategory));
        }

        var currentMonthTransactions = transactions
            .Where(transaction =>
                transaction.Date >= currentMonthStart
                && transaction.Date <= now
                && transaction.Date < currentMonthStart.AddMonths(1))
            .ToList();
        var categoryNames = categories.ToDictionary(category => category.Id.ToString(), category => category.Name);
        var forecastMonths = new List<ForecastMonth>(months);
        Dictionary<string, decimal> firstMonthByCategory = [];

        for (var monthOffset = 0; monthOffset < months; monthOffset++)
        {
            var monthStart = currentMonthStart.AddMonths(monthOffset);
            var monthEnd = monthStart.AddMonths(1);
            var isCurrentMonth = monthOffset == 0;
            var remainingFraction = isCurrentMonth
                ? Math.Max(0m, (decimal)(monthEnd - now).Ticks / (monthEnd - monthStart).Ticks)
                : 1m;
            var occurrenceStart = isCurrentMonth ? currentDay : DateOnly.FromDateTime(monthStart);
            var occurrenceEnd = DateOnly.FromDateTime(monthEnd);
            var scheduledForMonth = scheduledTransactions
                .Select(item => new ScheduledForecastItem(
                    item,
                    item.Amount * CountOccurrences(item, occurrenceStart, occurrenceEnd)))
                .Where(item => item.Amount != 0)
                .ToList();

            var trendIndex = monthlyHistory.Count + monthOffset;
            var income = (isCurrentMonth
                    ? currentMonthTransactions.Where(transaction => transaction.Amount > 0).Sum(transaction => transaction.Amount)
                    : 0m)
                + Math.Max(0m, Project(monthlyHistory.Select(history => history.Income).ToArray(), trendIndex, method)) * remainingFraction
                + scheduledForMonth.Where(item => item.Amount > 0).Sum(item => item.Amount);
            var expenses = (isCurrentMonth
                    ? currentMonthTransactions.Where(transaction => transaction.Amount < 0).Sum(transaction => Math.Abs(transaction.Amount))
                    : 0m)
                + Math.Max(0m, Project(monthlyHistory.Select(history => history.Expenses).ToArray(), trendIndex, method)) * remainingFraction
                + scheduledForMonth.Where(item => item.Amount < 0).Sum(item => Math.Abs(item.Amount));

            var categoryIds = new HashSet<string>(
                categories.Select(category => category.Id.ToString())
                    .Concat(monthlyHistory.SelectMany(history => history.ByCategory.Keys))
                    .Concat(scheduledForMonth.Select(item => GetScheduledCategoryId(item.Transaction, categories))));
            var byCategory = new Dictionary<string, decimal>(categoryIds.Count);
            foreach (var categoryId in categoryIds)
            {
                var categoryHistory = monthlyHistory
                    .Select(history => history.ByCategory.GetValueOrDefault(categoryId))
                    .ToArray();
                var actual = isCurrentMonth
                    ? currentMonthTransactions
                        .Where(transaction => transaction.CategoryId.ToString() == categoryId)
                        .Sum(transaction => transaction.Amount)
                    : 0m;
                var scheduledAmount = scheduledForMonth
                    .Where(item => GetScheduledCategoryId(item.Transaction, categories) == categoryId)
                    .Sum(item => item.Amount);

                byCategory[categoryId] = actual
                    + Project(categoryHistory, trendIndex, method) * remainingFraction
                    + scheduledAmount;
            }

            balance += income - expenses;
            forecastMonths.Add(new ForecastMonth(
                monthStart.ToString("yyyy-MM", CultureInfo.InvariantCulture),
                balance,
                income,
                expenses));

            if (isCurrentMonth)
            {
                firstMonthByCategory = byCategory;
            }
        }

        var topCategories = firstMonthByCategory
            .Select(item => new ForecastCategory(
                categoryNames.GetValueOrDefault(item.Key) ?? item.Key,
                Math.Abs(item.Value)))
            .Where(category => category.Amount > 0)
            .OrderByDescending(category => category.Amount)
            .Take(5)
            .ToList();

        return new ForecastResult(forecastMonths, topCategories);
    }

    private static decimal Project(decimal[] values, int monthIndex, ForecastMethod method)
    {
        if (method == ForecastMethod.Average)
        {
            var recent = values.TakeLast(3).ToArray();
            return recent.Length == 0 ? 0m : recent.Sum() / recent.Length;
        }

        var (slope, intercept) = LinearRegression(values);
        return intercept + slope * monthIndex;
    }

    private static (decimal Slope, decimal Intercept) LinearRegression(decimal[] values)
    {
        var count = values.Length;
        if (count == 0)
        {
            return (0m, 0m);
        }

        var xSum = (decimal)(count - 1) * count / 2;
        var xSquaredSum = (decimal)(count - 1) * count * (2 * count - 1) / 6;
        var ySum = values.Sum();
        var xySum = values.Select((value, index) => index * value).Sum();
        var denominator = count * xSquaredSum - xSum * xSum;

        if (denominator == 0)
        {
            return (0m, ySum / count);
        }

        var slope = (count * xySum - xSum * ySum) / denominator;
        return (slope, (ySum - slope * xSum) / count);
    }

    private static int CountOccurrences(
        ScheduledTransaction transaction,
        DateOnly rangeStart,
        DateOnly rangeEndExclusive)
    {
        var firstDate = DateOnly.FromDateTime(transaction.ReceivedDate);
        if (firstDate >= rangeEndExclusive)
        {
            return 0;
        }

        var frequency = transaction.Frequency.ToLowerInvariant();
        if (frequency == "one-time")
        {
            return firstDate >= rangeStart ? 1 : 0;
        }

        if (frequency is "weekly" or "bi-weekly")
        {
            var interval = frequency == "weekly" ? 7 : 14;
            var daysUntilFirstOccurrence = Math.Max(0, rangeStart.DayNumber - firstDate.DayNumber);
            var intervalsToSkip = (daysUntilFirstOccurrence + interval - 1) / interval;
            var occurrenceDayNumber = firstDate.DayNumber + intervalsToSkip * interval;
            var lastDayNumber = rangeEndExclusive.DayNumber - 1;
            return occurrenceDayNumber > lastDayNumber
                ? 0
                : (lastDayNumber - occurrenceDayNumber) / interval + 1;
        }

        DateOnly occurrence;
        if (frequency == "monthly")
        {
            var day = Math.Min(firstDate.Day, DateTime.DaysInMonth(rangeStart.Year, rangeStart.Month));
            occurrence = new DateOnly(rangeStart.Year, rangeStart.Month, day);
        }
        else if (frequency == "yearly")
        {
            var day = Math.Min(firstDate.Day, DateTime.DaysInMonth(rangeStart.Year, firstDate.Month));
            occurrence = new DateOnly(rangeStart.Year, firstDate.Month, day);
        }
        else
        {
            return 0;
        }

        return occurrence >= rangeStart && occurrence < rangeEndExclusive && occurrence >= firstDate ? 1 : 0;
    }

    private static string GetScheduledCategoryId(
        ScheduledTransaction transaction,
        IReadOnlyCollection<Category> categories)
    {
        if (string.IsNullOrWhiteSpace(transaction.Category))
        {
            return "uncategorized";
        }

        var category = categories.FirstOrDefault(item =>
            string.Equals(item.Name, transaction.Category, StringComparison.OrdinalIgnoreCase)
            || string.Equals(item.Id.ToString(), transaction.Category, StringComparison.OrdinalIgnoreCase));
        return category?.Id.ToString() ?? transaction.Category;
    }

    private sealed record MonthlyHistory(
        decimal Income,
        decimal Expenses,
        Dictionary<string, decimal> ByCategory);

    private sealed record ScheduledForecastItem(
        ScheduledTransaction Transaction,
        decimal Amount);
}
