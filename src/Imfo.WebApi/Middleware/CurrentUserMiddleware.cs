using System.Security.Claims;
using Imfo.ApplicationCore.Services.Users;
using Imfo.WebApi.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace Imfo.WebApi.Middleware;

public class CurrentUserMiddleware
{
    private readonly RequestDelegate _next;

    public CurrentUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var externalId = context.User.FindFirst("userId")?.Value;
            if (!string.IsNullOrEmpty(externalId))
            {
                var user = await userService.GetUserByExternalIdAsync(externalId);
                if (user == null)
                {
                    var isUserCreationRequest =
                        HttpMethods.IsPost(context.Request.Method) &&
                        context.Request.Path.Equals("/api/user", StringComparison.OrdinalIgnoreCase);

                    if (!isUserCreationRequest)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        await context.Response.WriteAsJsonAsync(new ProblemDetails
                        {
                            Status = StatusCodes.Status401Unauthorized,
                            Title = "Application user not found",
                            Detail = "Please sign in again to restore your account session."
                        });
                        return;
                    }
                }
                else
                {
                    var appIdentity = new ClaimsIdentity();
                    appIdentity.AddClaim(new Claim(ImfoClaimTypes.AppUserId, user.Id.ToString()));
                    context.User.AddIdentity(appIdentity);
                }
            }
        }

        await _next(context);
    }
}