using Backend.Common;
using Backend.Data.Domain.Stores;

namespace Backend.Services.Stores;

public interface IStoreService
{
    Task<Store> GetStoreAsync();
    Task CreateStoreBooksAsync(int storeId, List<int> bookIds);
    Task CreateStoreAsync(Store store);

    Task UpdateStoreAsync(Store store);

    Task<List<Store>> GetAllStoresAync();

    Task<Store> GetStoreByIdAsync(int id);

    Task<List<StoreBook>> GetStoreBooksByStoreIdAsync(int storeId);

    Task InsertStoreBooksAsync(int storeId, List<StoreBook> storeBooks);

    Task UpdateStoreBooksAsync( StoreBook storeBooks);

    Task<IPagedList<StoreBook>> GetPagedStoreBooksAsync(
   int storeId,
   string keyword = null,
    string stockFilter = null,
   int pageIndex = 0,
   int pageSize = 20);

    Task<StoreBook> GetStoreBookByIdAsync(int storeId, int bookId);
}
