using Imfo.ApplicationCore.Common.Entities;
using Imfo.ApplicationCore.Common.Interfaces;

namespace Imfo.ApplicationCore.Services.Categories;

public class CategoryService : ICategoryService
{
    private readonly IGenericRepository<Category> _repository;

    public CategoryService(IGenericRepository<Category> repository)
    {
        _repository = repository;
    }

    public Task<List<Category>> GetAllAsync(Guid userId)
    {
        return _repository.GetAllAsync(category => category.UserId == userId || category.UserId == Guid.Empty);
    }

    public Task<Category> CreateAsync(Category category)
    {
        return _repository.AddAsync(category);
    }
}
