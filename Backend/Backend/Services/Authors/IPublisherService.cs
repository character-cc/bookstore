using Backend.Common;
using System.Linq.Expressions;
using Backend.Data.Domain.Authors;

namespace Backend.Services.Authors;

public interface IPublisherService
{

    Task<List<Publisher>> GetAllPublishersAsync();

    Task<IPagedList<Publisher>> GetAllAsync(string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue);
    Task<Publisher> GetByIdAsync(int id);
    Task CreateAsync(Publisher publisher);
    Task UpdateAsync(int id, Publisher publisher);
    Task DeleteAsync(int id);
}
