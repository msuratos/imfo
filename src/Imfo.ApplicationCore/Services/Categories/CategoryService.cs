using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces.Repositories;

namespace Imfo.ApplicationCore.Services.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public Task<List<Category>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllForUserAsync(userId);
    }

    public Task<Category> CreateAsync(Category category)
    {
        return _repository.AddAsync(category);
    }
}
