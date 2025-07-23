using Backend.Common;
using System.Linq.Expressions;
using Backend.Data;
using Backend.Data.Domain.Authors;
using LinqToDB;

namespace Backend.Services.Authors;

public class PublisherService : IPublisherService
{
    private readonly IRepository<Publisher> _publisherRepository;

    public PublisherService(IRepository<Publisher> publisherRepository)
    {
        _publisherRepository = publisherRepository ?? throw new ArgumentNullException(nameof(publisherRepository), "Publisher repository is not initialized.");
    }

    public async Task<List<Publisher>> GetAllPublishersAsync()
    {
        return await _publisherRepository.EntitySet.ToListAsync();
    }

    public async Task<IPagedList<Publisher>> GetAllAsync(string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        var query = _publisherRepository.EntitySet;

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(p => p.Name.Contains(keyword));

        query = query.OrderByDescending( p => p.UpdatedAt);

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }



    public async Task<Publisher> GetByIdAsync(int id)
    {
        var publisher = await _publisherRepository.EntitySet
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException($"Publisher with ID {id} not found");
        return publisher;
    }

    public async Task CreateAsync(Publisher publisher)
    {
        await _publisherRepository.InsertAsync(publisher);
    }

    public async Task UpdateAsync(int id, Publisher publisher)
    {




        await _publisherRepository.UpdateAsync(publisher);
    }

    public async Task DeleteAsync(int id)
    {
        var publisher = await _publisherRepository.EntitySet
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException($"Publisher with ID {id} not found");

        await _publisherRepository.DeleteAsync(publisher);
    }
}
