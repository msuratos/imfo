using Imfo.WebApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Imfo.WebApi.Security;

var builder = WebApplication.CreateBuilder(args);

// Add EF Core InMemory DbContext
builder.Services.AddDbContext<ImfoDbContext>(options =>
    options.UseInMemoryDatabase("ImfoDb"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication("Demo").AddScheme<AuthenticationSchemeOptions, DemoAuthenticationHandler>("Demo", options => { });
builder.Services.AddAuthorization();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

// Seed demo data centrally
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ImfoDbContext>();
    if (!db.Users.Any())
    {
        var demoUser = new Imfo.WebApi.Models.User { Id = Guid.NewGuid(), Username = "demo", Password = "demo" };
        db.Users.Add(demoUser);

        db.Assets.AddRange(new[] {
            new Imfo.WebApi.Models.Asset { Id = Guid.NewGuid(), Name = "Laptop", Value = 1200m, Type = "Electronics", AcquiredDate = DateTime.UtcNow, UserId = demoUser.Id },
            new Imfo.WebApi.Models.Asset { Id = Guid.NewGuid(), Name = "Bike", Value = 300m, Type = "Transport", AcquiredDate = DateTime.UtcNow, UserId = demoUser.Id }
        });

        db.BudgetItems.AddRange(new[] {
            new Imfo.WebApi.Models.BudgetItem { Id = Guid.NewGuid(), Title = "Salary", Amount = 5000, Category = "Income", Date = DateTime.UtcNow, UserId = demoUser.Id },
            new Imfo.WebApi.Models.BudgetItem { Id = Guid.NewGuid(), Title = "Rent", Amount = -1200, Category = "Housing", Date = DateTime.UtcNow, UserId = demoUser.Id },
            new Imfo.WebApi.Models.BudgetItem { Id = Guid.NewGuid(), Title = "Groceries", Amount = -300, Category = "Food", Date = DateTime.UtcNow, UserId = demoUser.Id }
        });

        db.Transactions.AddRange(new[] {
            new Imfo.WebApi.Models.Transaction { Id = Guid.NewGuid(), Description = "Invoice #1", Amount = 150.00m, Category = "Income", Date = DateTime.UtcNow, UserId = demoUser.Id },
            new Imfo.WebApi.Models.Transaction { Id = Guid.NewGuid(), Description = "Coffee", Amount = -3.50m, Category = "Food", Date = DateTime.UtcNow, UserId = demoUser.Id }
        });

        db.SaveChanges();
    }
}

app.Run();
