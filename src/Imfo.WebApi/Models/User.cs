namespace Imfo.WebApi.Models;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // NOTE: plain text for demo only
}
