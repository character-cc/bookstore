using Backend.Common;
using Backend.Data.Domain.Products;
using Backend.DTO.Products;
using System.Linq.Expressions;

namespace Backend.Services.Products;

public interface IBookService
{
    #region books

    Task DeleteBookAsync(Book book);
    Task<IPagedList<BookProfitReportDto>> GetBookProfitReportAsync(BookProfitReportRequest request);
    Task InsertImportBookAsync(ImportBook importBook);
    Task<decimal> CalculateTotalCostPriceAsync(int bookId, int quantity);
    Task<bool> SubtractStockAsync(int bookId, int quantityToSubtract);
    Task<int> GetStockQuantityAsync(int bookId);
    Task DeleteImportBookAsync(int id);

    Task<IPagedList<ImportBook>> GetAllImportBooksAsync(
        string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue,
        bool getOnlyTotalCount = false);
    Task UpdateBookAsync(Book book);
    Task<IPagedList<Book>> SearchBooksAsync(SearchRequest request);
    Task<IPagedList<Book>> GetAllBooksAsync(
    string name = null,
    string isbn = null,
    Expression<Func<Book, object>> orderBy = null,
    bool? orderDesc = null,
    int pageIndex = 0,
    int pageSize = int.MaxValue,
    bool getOnlyTotalCount = false);

    Task<IPagedList<Book>> GetBooksOfStoreInventoryAsync(
        int storeId ,
        string keyword = null,
        int pageIndex = 0,
        int pageSize = 100);

    Task<IPagedList<Book>> GetFilteredBooksAsync(
    string keyword = null,
    bool? markAsNew = null,
    bool? markAsBestseller = null,
    bool onlyDiscounted = false,
    Expression<Func<Book, object>> orderBy = null,
    bool orderDesc = false,
    int pageIndex = 0,
    int pageSize = 10);

    Task<IPagedList<Book>> GetBooksByCategoryIdAsync(
        int categoryId,
   Expression<Func<Book, object>> orderBy = null,
   bool orderDesc = false,
   int pageIndex = 0,
   int pageSize = 10);

    Task<int> CreateBookAsync(CreateBookRequest request);
    Task UpdateBookAsync(int id, CreateBookRequest request);
    Task<Book> GetBookAsync(int id);


    Task<Book> GetBookDetailAsync(int id);

    Task<List<Book>> GetBooksOnSaleForHomePageAsync(
        int pageIndex = 0,
        int pageSize = int.MaxValue);

    Task<List<Book>> GetNewBooksForHomePageAsync(
        int pageIndex = 0,
        int pageSize = int.MaxValue);

    Task<List<Book>> GetBestsellersForHomePageAsync(
        int pageIndex = 0,
        int pageSize = int.MaxValue);
    #endregion

    #region custom attributes

    Task<IPagedList<CustomAttribute>> GetCustomAttributesAsync(
        int bookId,
        string name = null,
        Expression<Func<CustomAttribute, object>> orderBy = null,
        bool? orderDesc = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue,
        bool getOnlyTotalCount = false);


    Task<int> CreateCustomAttributeAsync( CreateCustomAttributeRequest request);

    Task<CustomAttribute> GetCustomAttributeAsync(int id);

    Task UpdateCustomAttributeAsync(int id, CreateCustomAttributeRequest request);

    Task DeleteCustomAttributeAsync(int id);

    Task<int> CreateAttributeValueAsync(int attributeId, CreateAttributeValueRequest request);

    Task UpdateAttributeValueAsync(int id, CreateAttributeValueRequest request);

    Task DeleteAttributeValueAsync(int id);

    Task<bool> SubtractStockWithTrackingAsync(int orderId, int bookId, int quantityToSubtract);

    #endregion
}
