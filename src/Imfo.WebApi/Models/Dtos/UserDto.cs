namespace Imfo.WebApi.Models.Dtos;

public class UserCreateDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UserReadDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
}
