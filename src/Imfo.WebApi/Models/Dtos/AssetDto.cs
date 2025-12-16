namespace Imfo.WebApi.Models.Dtos;

public class AssetCreateDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime AcquiredDate { get; set; }
    
}

public class AssetReadDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime AcquiredDate { get; set; }
    public Guid UserId { get; set; }
}
