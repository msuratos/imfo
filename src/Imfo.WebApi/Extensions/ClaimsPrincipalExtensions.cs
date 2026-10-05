using System.Security.Claims;

namespace Imfo.WebApi.Extensions;

public static class ImfoClaimTypes
{
    public const string AppUserId = "imfo:app_user_id";
}

public static class ClaimsPrincipalExtensions
{
    public static Guid GetCurrentUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirst(ImfoClaimTypes.AppUserId)?.Value;
        return Guid.TryParse(userId, out var id) ? id : Guid.Empty;
    }
}