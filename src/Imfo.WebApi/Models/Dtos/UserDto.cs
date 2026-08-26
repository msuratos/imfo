namespace Imfo.WebApi.Models.Dtos;

public class UserCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

public class UserReadDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}
