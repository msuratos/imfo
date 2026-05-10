using Imfo.ApplicationCore.Common.Entities;

namespace Imfo.ApplicationCore.Services.Categories;

public interface ICategoryService
{
    Task<List<Category>> GetAllAsync(Guid userId);
    Task<Category> CreateAsync(Category category);
}
