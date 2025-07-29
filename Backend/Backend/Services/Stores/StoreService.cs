using Backend.Common;
using Backend.Data;
using Backend.Data.Domain.Stores;
using LinqToDB;

namespace Backend.Services.Stores;

public class StoreService : IStoreService
{
    private readonly IRepository<Store> _storeRepository;

    private readonly IRepository<StoreBook> _storeBookRepository;

    public StoreService(IRepository<Store> storeRepository, IRepository<StoreBook> storeBookRepository)
    {
        _storeRepository = storeRepository ?? throw new ArgumentNullException(nameof(storeRepository));
        _storeBookRepository = storeBookRepository ?? throw new ArgumentNullException(nameof(storeBookRepository));
    }

    public async Task<Store> GetStoreAsync()
    {
        return await _storeRepository.EntitySet
            .FirstOrDefaultAsync();
    }

    public async Task CreateStoreAsync(Store store)
    {
        if (store == null)
            throw new ArgumentNullException(nameof(store));
        await _storeRepository.InsertAsync(store);
    }

    public async Task UpdateStoreAsync(Store store)
    {
        if (store == null)
            throw new ArgumentNullException(nameof(store));
        if (store.Id <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(store.Id));
        await _storeRepository.UpdateAsync(store);
    }

    public async Task<List<Store>> GetAllStoresAync()
    {
        return await _storeRepository.EntitySet.ToListAsync();
    }

    public async Task<Store> GetStoreByIdAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(id));
        return await _storeRepository.EntitySet.Where(s => s.Id == id).FirstOrDefaultAsync();
    }


    public async Task<IPagedList<StoreBook>> GetPagedStoreBooksAsync(
    int storeId,
    string keyword = null,
    string stockFilter = null,
    int pageIndex = 0,
    int pageSize = 20)
    {
        if (storeId <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(storeId));

        var query = _storeBookRepository.EntitySet
            .Where(sb => sb.StoreId == storeId);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(sb =>
                sb.Book.Name.Contains(keyword) || sb.Book.Isbn.Contains(keyword));
        }
        if (!string.IsNullOrWhiteSpace(stockFilter))
        {
            stockFilter = stockFilter.ToLowerInvariant();

            if (stockFilter == "in-stock")
                query = query.Where(sb => sb.Quantity > 0);
            else if (stockFilter == "low-stock")
                query = query.Where(sb => sb.Quantity > 0 && sb.Quantity <= sb.LowStockThreshold);
            else if (stockFilter == "out-of-stock")
                query = query.Where(sb => sb.Quantity == 0);
        }
        query = query
            .LoadWith(sb => sb.Book)
            .ThenLoad(b => b.Authors)
            .LoadWith(sb => sb.Book)
            .ThenLoad(b => b.Images);


        return await query.ToPagedListAsync(pageIndex, pageSize);
    }


    public async Task<List<StoreBook>> GetStoreBooksByStoreIdAsync(int storeId)
    {
        if (storeId <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(storeId));
        return await _storeBookRepository
            .EntitySet
            .Where(sb => sb.StoreId == storeId)
            .LoadWith(sb => sb.Book)
            .ThenLoad(b => b.Authors)
            .LoadWith(sb => sb.Book)
            .ThenLoad(b => b.Images)
            .ToListAsync();
    }

    public async Task InsertStoreBooksAsync(int storeId, List<StoreBook> storeBooks)
    {
        if (storeBooks == null || !storeBooks.Any())
            throw new ArgumentNullException(nameof(storeBooks), "Store books cannot be null or empty.");
        if (storeId <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(storeId));
        foreach (var storeBook in storeBooks)
        {
            storeBook.StoreId = storeId;
            await _storeBookRepository.InsertAsync(storeBook);
        }
    }

    public async Task UpdateStoreBooksAsync(StoreBook storeBook)
    {
        if (storeBook == null)
            throw new ArgumentNullException(nameof(storeBook));
        if (storeBook.Id <= 0)
            throw new ArgumentException("Store book ID must be greater than zero.", nameof(storeBook.Id));
        await _storeBookRepository.UpdateAsync(storeBook);
    }

    public async Task<StoreBook> GetStoreBookByIdAsync(int storeId, int bookId)
    {
        if (storeId <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(storeId));
        if (bookId <= 0)
            throw new ArgumentException("Book ID must be greater than zero.", nameof(bookId));
        return await _storeBookRepository.EntitySet
            .Where(sb => sb.StoreId == storeId && sb.BookId == bookId)
            .LoadWith(sb => sb.Book)
            .ThenLoad(b => b.Authors)
            .LoadWith(sb => sb.Book)
            .ThenLoad(b => b.Images)
            .FirstOrDefaultAsync();
    }

    public async Task CreateStoreBooksAsync(int storeId, List<int> bookIds)
    {
        if (bookIds == null || !bookIds.Any())
            throw new ArgumentNullException(nameof(bookIds), "Book IDs cannot be null or empty.");
        if (storeId <= 0)
            throw new ArgumentException("Store ID must be greater than zero.", nameof(storeId));
        var storeBooks = bookIds.Select(bookId => new StoreBook
        {
            StoreId = storeId,
            BookId = bookId,
            Quantity = 0, 
            LowStockThreshold = 5 
        }).ToList();
        await InsertStoreBooksAsync(storeId, storeBooks);
    }
}
