using Backend.Common;
using System.Linq.Expressions;
using Backend.Data.Domain.Authors;

namespace Backend.Services.Authors;

public interface IAuthorService
{

    Task<List<Author>> GetAllAuthorsAsync();

    Task<List<Author>> GetAuthorsForHomePageAsync(int pageIndex = 0, int pageSize = int.MaxValue);

    Task<int> GetBookCountOfAuthorAsync(int authorId);

    Task<IPagedList<Author>> GetAllAsync(string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue);

    Task<Author> GetByIdAsync(int id);
    Task CreateAsync(Author author);
    Task UpdateAsync(int id, Author author);
    Task DeleteAsync(int id);

}
