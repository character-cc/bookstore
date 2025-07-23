using AutoMapper;
using Backend.Common;
using Backend.Data;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Stores;
using Backend.DTO.Products;
using LinqToDB;
using System;
using System.Linq.Expressions;

namespace Backend.Services.Products;

public class BookService : IBookService
{

    private readonly IRepository<Book> _bookRepository;
    private readonly IRepository<AttributeCombination> _attributeCombinationRepository;
    private readonly IRepository<BookAuthor> _bookAuthorRepository;
    private readonly IRepository<BookCategory> _bookCategoryRepository;
    private readonly IRepository<BookPublisher> _bookPublisherRepository;
    private readonly IRepository<BookImage> _bookImageRepository;
    private readonly IRepository<CustomAttribute> _customAttributeRepository;
    private readonly IRepository<AttributeValue> _attributeValueRepository;
    private readonly IRepository<StoreBook> _storeBookRepository;
    private readonly IRepository<OrderItem> _orderItemRepository;
    private readonly IRepository<ImportBook> _importBookRepository;
    private readonly IRepository<InventoryTransaction> _inventoryTransactionRepository;
    private readonly IMapper _mapper;

    public BookService(IRepository<Book> bookRepository, IRepository<AttributeCombination> attributeCombinationRepository, IRepository<BookAuthor> bookAuthorRepository, IRepository<BookCategory> bookCategoryRepository, IRepository<BookPublisher> bookPublisherRepository, IRepository<BookImage> bookImageRepository, IRepository<CustomAttribute> customAttributeRepository, IRepository<AttributeValue> attributeValueRepository, IRepository<StoreBook> storeBookRepository, IRepository<OrderItem> orderItemRepository, IRepository<ImportBook> importBookRepository, IRepository<InventoryTransaction> inventoryTransactionRepository, IMapper mapper)
    {
        _bookRepository = bookRepository;
        _attributeCombinationRepository = attributeCombinationRepository;
        _bookAuthorRepository = bookAuthorRepository;
        _bookCategoryRepository = bookCategoryRepository;
        _bookPublisherRepository = bookPublisherRepository;
        _bookImageRepository = bookImageRepository;
        _customAttributeRepository = customAttributeRepository;
        _attributeValueRepository = attributeValueRepository;
        _storeBookRepository = storeBookRepository;
        _orderItemRepository = orderItemRepository;
        _importBookRepository = importBookRepository;
        _inventoryTransactionRepository = inventoryTransactionRepository;
        _mapper = mapper;
    }







    #region book

    public async Task DeleteBookAsync(Book book)
    {
        if (book == null)
        {
            throw new ArgumentNullException(nameof(book), "Book cannot be null");
        }
        await _bookRepository.DeleteAsync(book);
    }
    public async Task<IPagedList<BookProfitReportDto>> GetBookProfitReportAsync(BookProfitReportRequest request)
    {
        var from = request.From ?? DateTime.MinValue;
        var to = request.To ?? DateTime.MaxValue;

        var bookQuery = _bookRepository.EntitySet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            bookQuery = bookQuery.Where(b => b.Name.Contains(request.Keyword) || b.Isbn.Contains(request.Keyword));
        }
        bookQuery = bookQuery.LoadWith(b => b.Images).LoadWith(b => b.Authors)
            .LoadWith(b => b.Categories).LoadWith(b => b.Publishers);
        var books = await bookQuery.ToListAsync();
        var bookIds = books.Select(b => b.Id).ToList();

        var orderItems = await _orderItemRepository.EntitySet
            .Where(oi => bookIds.Contains(oi.BookId)
                         && oi.Order.Status == OrderStatus.Completed.ToString()
                         && oi.Order.IsComplete
                         && oi.Order.CreatedAt >= from
                         && oi.Order.CreatedAt <= to)
            .ToListAsync();

        var importBooks = await _importBookRepository.EntitySet
            .Where(i => bookIds.Contains(i.BookId))
            .ToListAsync();

        var result = books.Select(book =>
        {
            var orders = orderItems.Where(x => x.BookId == book.Id);
            var imports = importBooks.Where(x => x.BookId == book.Id);

            return new BookProfitReportDto
            {
                Book = _mapper.Map<BookDto>(book),
                TotalRevenue = orders.Sum(x => x.UnitPrice * x.Quantity),
                TotalCost = orders.Sum(x => x.TotalCostPrice),
                CurrentStock = imports.Sum(x => x.StockQuantity),
                TotalImportedQuantity = imports.Sum(x => x.InitialStockQuantity)
            };
        });

        if (!string.IsNullOrWhiteSpace(request.SortBy))
        {
            result = request.SortBy switch
            {
                nameof(BookProfitReportDto.CurrentStock) => request.SortDesc ? result.OrderByDescending(r => r.CurrentStock) : result.OrderBy(r => r.CurrentStock),
                nameof(BookProfitReportDto.TotalImportedQuantity) => request.SortDesc ? result.OrderByDescending(r => r.TotalImportedQuantity) : result.OrderBy(r => r.TotalImportedQuantity),
                nameof(BookProfitReportDto.TotalRevenue) => request.SortDesc ? result.OrderByDescending(r => r.TotalRevenue) : result.OrderBy(r => r.TotalRevenue),
                nameof(BookProfitReportDto.TotalCost) => request.SortDesc ? result.OrderByDescending(r => r.TotalCost) : result.OrderBy(r => r.TotalCost),
                nameof(BookProfitReportDto.Profit) => request.SortDesc ? result.OrderByDescending(r => r.Profit) : result.OrderBy(r => r.Profit),
                _ => result.OrderByDescending(r => r.Profit)
            };
        }
        else
        {
            result = result.OrderByDescending(r => r.Profit);
        }

        return result.ToPagedList(request.PageIndex, request.PageSize);
    }

    public async Task<decimal> CalculateTotalCostPriceAsync(int bookId, int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Số lượng cần tính phải lớn hơn 0.");

        var book = await _bookRepository.Table
            .FirstOrDefaultAsync(b => b.Id == bookId && !b.IsDeleted);
        if (book == null)
            throw new KeyNotFoundException("Sách không tồn tại.");
        if (book.InventoryManagementMethodId == (int)InventoryManagementMethodType.None)
        {
            return book.CostPrice * quantity;
        }

        var importBatches = await _importBookRepository.Table
            .Where(ib => ib.BookId == bookId && ib.StockQuantity > 0)
            .OrderBy(ib => ib.CreatedAt)
            .ToListAsync();

        int remaining = quantity;
        decimal totalCost = 0;

        foreach (var batch in importBatches)
        {
            if (remaining <= 0)
                break;

            int quantityUsed = Math.Min(batch.StockQuantity, remaining);
            totalCost += quantityUsed * batch.CostPrice;
            remaining -= quantityUsed;
        }

        if (remaining > 0)
            throw new InvalidOperationException("Không đủ tồn kho để tính tổng giá gốc.");

        return totalCost;
    }


    public async Task InsertImportBookAsync(ImportBook importBook)
    {
        if (importBook == null)
        {
            throw new ArgumentNullException(nameof(importBook), "Book cannot be null");
        }
        await _importBookRepository.InsertAsync(importBook);
    }

    public async Task DeleteImportBookAsync(int id)
    {
        var importBook = await _importBookRepository.Table.FirstOrDefaultAsync(b => b.Id == id);
        if (importBook == null)
        {
            throw new KeyNotFoundException("Import book not found");
        }
        await _importBookRepository.DeleteAsync(importBook);
    }
    public async Task<bool> SubtractStockAsync(int bookId, int quantityToSubtract)
    {
        if (quantityToSubtract <= 0)
            throw new ArgumentException("Số lượng cần trừ phải lớn hơn 0.");

        var importBatches = await _importBookRepository.Table
            .Where(ib => ib.BookId == bookId && ib.StockQuantity > 0)
            .OrderBy(ib => ib.CreatedAt)
            .ToListAsync();

        int remaining = quantityToSubtract;

        foreach (var batch in importBatches)
        {
            if (remaining <= 0)
                break;

            if (batch.StockQuantity >= remaining)
            {
                batch.StockQuantity -= remaining;
                remaining = 0;
            }
            else
            {
                remaining -= batch.StockQuantity;
                batch.StockQuantity = 0;
            }

            await _importBookRepository.UpdateAsync(batch); 
        }

        if (remaining > 0)
        {
            return false;
        }

        return true;
    }

    public async Task<bool> SubtractStockWithTrackingAsync(int orderId , int bookId, int quantityToSubtract)
    {
        if (quantityToSubtract <= 0)
            throw new ArgumentException("Số lượng cần trừ phải lớn hơn 0.");

        var importBatches = await _importBookRepository.Table
            .Where(ib => ib.BookId == bookId && ib.StockQuantity > 0)
            .OrderBy(ib => ib.CreatedAt)
            .ToListAsync();

        int remaining = quantityToSubtract;
        var transactions = new List<InventoryTransaction>();

        foreach (var batch in importBatches)
        {
            if (remaining <= 0)
                break;

            int subtractQty = Math.Min(batch.StockQuantity, remaining);
            remaining -= subtractQty;
            transactions.Add(new InventoryTransaction
            {
                OrderId = orderId,
                BookId = bookId,
                ImportBookId = batch.Id,
                Quantity = subtractQty
            });
        }

        if (remaining > 0)
            return false;

        foreach (var tx in transactions)
            await _inventoryTransactionRepository.InsertAsync(tx);

        return true;
    }

    public async Task<int> GetStockQuantityAsync(int bookId)
    {
        var  quantity = await _importBookRepository.Table.Where(ib => ib.BookId == bookId)
            .SumAsync(ci => ci.StockQuantity);
        return quantity;
    }

    public async Task<IPagedList<ImportBook>> GetAllImportBooksAsync(
        string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue,
        bool getOnlyTotalCount = false)
    {
        var query = _importBookRepository.EntitySet
            .Where(ib => !ib.Book.IsDeleted);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(ib =>
                ib.Book.Name.Contains(keyword) || ib.Book.Isbn.Contains(keyword));
        }
        query = query.LoadWith(query => query.Book).LoadWith(query => query.Book.Authors)
            .LoadWith(query => query.Book.Images)
            .LoadWith(query => query.Book.Categories)
            .LoadWith(query => query.Book.Publishers)
            .OrderByDescending(query => query.CreatedAt);

        return await query.ToPagedListAsync(pageIndex, pageSize, getOnlyTotalCount);
    }
    


    public async Task UpdateBookAsync(Book book)
    {
        if (book == null)
        {
            throw new ArgumentNullException(nameof(book), "Book cannot be null");

        }
        await _bookRepository.UpdateAsync(book);
    }

    public async Task<IPagedList<Book>> GetBooksOfStoreInventoryAsync(
      int storeId = 0,
      string keyword = null,
      int pageIndex = 0,
      int pageSize = 100)
    {
        var bookQuery = _bookRepository.EntitySet
            .LoadWith(b => b.Authors)
            .LoadWith(b => b.Images)
            .Where(b => !b.IsDeleted && b.InventoryManagementMethodId == (int)InventoryManagementMethodType.StoreTracking);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            bookQuery = bookQuery.Where(b =>
                b.Name.Contains(keyword) || b.Isbn.Contains(keyword));
        }

        var resultQuery = from book in bookQuery
                          where !_storeBookRepository.EntitySet
                              .Where(sb => sb.StoreId == storeId)
                              .Select(sb => sb.BookId)
                              .Contains(book.Id)
                          select book;

        return await resultQuery.ToPagedListAsync(pageIndex, pageSize);
    }


    public async Task<IPagedList<Book>> SearchBooksAsync(SearchRequest request)
    {
        var query = _bookRepository.EntitySet;

        if (!string.IsNullOrWhiteSpace(request.Keyword))
            query = query.Where(b => b.Name.Contains(request.Keyword));

        if (request.CategoryIds?.Any() == true)
        {
            var bookIdsByCategory = _bookCategoryRepository.EntitySet
                .Where(bc => request.CategoryIds.Contains(bc.CategoryId))
                .Select(bc => bc.BookId)
                .Distinct();

            query = query.Where(b => bookIdsByCategory.Contains(b.Id));
        }

        if (request.AuthorIds?.Any() == true)
        {
            var bookIdsByAuthor = _bookAuthorRepository.EntitySet
                .Where(ba => request.AuthorIds.Contains(ba.AuthorId))
                .Select(ba => ba.BookId)
                .Distinct();

            query = query.Where(b => bookIdsByAuthor.Contains(b.Id));
        }

        if (request.MinPrice.HasValue)
            query = query.Where(b => b.SalePrice >= request.MinPrice.Value);

        if (request.MaxPrice.HasValue)
            query = query.Where(b => b.SalePrice <= request.MaxPrice.Value);

        if (request.IsSale == true)
            query = query.Where(b => b.OriginalPrice < b.SalePrice);

        query = query.Where(b => !b.IsDeleted);

        var orderByExpr = SortableFields.GetSelector<Book>(request.SortBy);
        if (orderByExpr != null)
        {
            query = (request.SortDesc ?? false)
                ? query.OrderByDescending(orderByExpr)
                : query.OrderBy(orderByExpr);
        }
        else
        {
            query = query.OrderByDescending(b => b.UpdatedAt);
        }
        query = query.LoadWith(b => b.Authors).LoadWith(b => b.Images);
        return await query.ToPagedListAsync(request.PageIndex, request.PageSize);
    }


    public async Task<IPagedList<Book>> GetAllBooksAsync(
    string name = null,
    string isbn = null,
    Expression<Func<Book, object>> orderBy = null,
    bool? orderDesc = null,
    int pageIndex = 0,
    int pageSize = int.MaxValue,
    bool getOnlyTotalCount = false)
    {
        var query = _bookRepository.Table.LoadWith(b => b.Categories).LoadWith(b => b.Authors).LoadWith(b => b.Publishers)
            .LoadWith(b => b.Authors).LoadWith(b => b.Images).Where(b => !b.IsDeleted);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(b => b.Name.Contains(name));

        if (!string.IsNullOrWhiteSpace(isbn))
            query = query.Where(b => b.Isbn.Contains(isbn));

        if (orderBy != null)
        {
            query = (orderDesc ?? false)
                ? query.OrderByDescending(orderBy)
                : query.OrderBy(orderBy);
        }

        var pagedList = await query.ToPagedListAsync(pageIndex, pageSize, getOnlyTotalCount);

        if (getOnlyTotalCount)
            return pagedList;


        return new PagedList<Book>(pagedList.Items, pageIndex, pageSize, pagedList.TotalCount);
    }

    public async Task<int> CreateBookAsync(CreateBookRequest request)
    {
        var book = _mapper.Map<Book>(request);

        await _bookRepository.InsertAsync(book);

        await InsertBookRelationshipsAsync(book.Id, request);

        return book.Id;
    }

    public async Task UpdateBookAsync(int id, CreateBookRequest request)
    {
        var existingBook = await _bookRepository.Table
            .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);

        if (existingBook == null)
            throw new KeyNotFoundException("Book not found");

        _mapper.Map(request, existingBook);
        existingBook.UpdatedAt = DateTime.UtcNow;

        await _bookRepository.UpdateAsync(existingBook);

        await _bookAuthorRepository.Table.Where(ba => ba.BookId == id).DeleteAsync();
        await _bookCategoryRepository.Table.Where(bc => bc.BookId == id).DeleteAsync();
        await _bookPublisherRepository.Table.Where(bp => bp.BookId == id).DeleteAsync();
        await _bookImageRepository.Table.Where(bi => bi.BookId == id).DeleteAsync();

        await InsertBookRelationshipsAsync(id, request);
    }

    public async Task<Book> GetBookAsync(int id)
    {
        var book = await _bookRepository.Table
            .Where(b => b.Id == id && !b.IsDeleted)
            .LoadWith(b => b.Authors)
            .LoadWith(b => b.Images)
            .LoadWith(b => b.Categories)
            .LoadWith(b => b.Publishers)
            .FirstOrDefaultAsync();

        return book;
    }

    public async Task<Book> GetBookDetailAsync(int id)
    {
        var book = await _bookRepository.Table
            .Where(b => b.Id == id && !b.IsDeleted)
            .LoadWith(b => b.Authors)
            .LoadWith(b => b.Images)
            .LoadWith(b => b.Categories)
            .LoadWith(b => b.Publishers)
            .LoadWith(b => b.CustomAttributes)
            .ThenLoad(b => b.Values)
            .FirstOrDefaultAsync();
        return book;
    }

    private async Task InsertBookRelationshipsAsync(int bookId, CreateBookRequest request)
    {
        var bookAuthors = request.AuthorIds.Select(authorId => new BookAuthor
        {
            BookId = bookId,
            AuthorId = authorId
        }).ToList();
        if (bookAuthors.Any())
            await _bookAuthorRepository.InsertAsync(bookAuthors);

        var bookCategories = request.CategoryIds.Select(categoryId => new BookCategory
        {
            BookId = bookId,
            CategoryId = categoryId
        }).ToList();
        if (bookCategories.Any())
            await _bookCategoryRepository.InsertAsync(bookCategories);

        var bookPublishers = request.PublisherIds.Select(publisherId => new BookPublisher
        {
            BookId = bookId,
            PublisherId = publisherId
        }).ToList();
        if (bookPublishers.Any())
            await _bookPublisherRepository.InsertAsync(bookPublishers);

        var bookImages = request.ImageUrls.Select(imageUrl => new BookImage
        {
            BookId = bookId,
            ImageUrl = imageUrl,
        }).ToList();
        if (bookImages.Any())
            await _bookImageRepository.InsertAsync(bookImages);
    }

    public async Task<List<Book>> GetBooksOnSaleForHomePageAsync(
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        return await _bookRepository.EntitySet.LoadWith(b => b.Authors).LoadWith(b => b.Images)
            .Where(b => b.SalePrice < b.OriginalPrice && !b.IsDeleted)
            .OrderBy(b => b.DisplayOrderAsSale)
            .ThenByDescending(b => b.UpdatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<Book>> GetNewBooksForHomePageAsync(
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        return await _bookRepository.EntitySet.LoadWith(b => b.Authors).LoadWith(b => b.Images)
            .Where(b =>   !b.IsDeleted)
            .OrderBy(b => b.DisplayOrderAsNew)
             .ThenByDescending(b => b.UpdatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<List<Book>> GetBestsellersForHomePageAsync(
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        return await _bookRepository.EntitySet.LoadWith(b => b.Authors).LoadWith(b => b.Images)
            .Where(b =>  !b.IsDeleted)
            .OrderBy(b => b.DisplayOrderBestseller)
            .ThenByDescending(b => b.UpdatedAt)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
    public async Task<IPagedList<Book>> GetFilteredBooksAsync(
    string keyword = null,
    bool? markAsNew = null,
    bool? markAsBestseller = null,
    bool onlyDiscounted = false,
    Expression<Func<Book, object>> orderBy = null,
    bool orderDesc = false,
    int pageIndex = 0,
    int pageSize = 10)
    {
        var query = _bookRepository.EntitySet.LoadWith(b => b.Authors)
            .LoadWith(b => b.Images).Where(b => !b.IsDeleted);

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(b => b.Name.Contains(keyword));

        if (markAsNew.HasValue)
            query = query.Where(b => b.MarkAsNew == markAsNew.Value);

        if (markAsBestseller.HasValue)
            query = query.Where(b => b.MarkAsBestseller == markAsBestseller.Value);

        if (onlyDiscounted)
            query = query.Where(b => b.SalePrice < b.OriginalPrice && b.OriginalPrice > 0);

        if (orderBy != null)
            query = orderDesc ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }

    public async Task<IPagedList<Book>> GetBooksByCategoryIdAsync(
        int categoryId,
   Expression<Func<Book, object>> orderBy = null,
   bool orderDesc = false,
   int pageIndex = 0,
   int pageSize = 10)
    {
        var bookIds = await _bookCategoryRepository.EntitySet
            .Where(bc => bc.CategoryId == categoryId)
            .Select(bc => bc.BookId)
            .ToListAsync();
        var query = _bookRepository.EntitySet
            .LoadWith(b => b.Authors)
            .LoadWith(b => b.Images)
            .Where(b => bookIds.Contains(b.Id) && !b.IsDeleted);

        if (orderBy != null)
            query = orderDesc ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }

    #endregion

    #region custum attribute

    public async Task<IPagedList<CustomAttribute>> GetCustomAttributesAsync(
        int bookId,
        string name = null,
        Expression<Func<CustomAttribute, object>> orderBy = null,
        bool? orderDesc = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue,
        bool getOnlyTotalCount = false)
    {
        var query = _customAttributeRepository.Table.LoadWith(ca => ca.Values)
            .Where(ca => ca.BookId == bookId)
            ;
        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(ca => ca.Name.Contains(name));
        if (orderBy != null)
        {
            query = (orderDesc ?? false)
                ? query.OrderByDescending(orderBy)
                : query.OrderBy(orderBy);
        }
        return await query.ToPagedListAsync(pageIndex, pageSize, getOnlyTotalCount);
    }

    public async Task<int> CreateCustomAttributeAsync(CreateCustomAttributeRequest request)
    {
        var attribute = _mapper.Map<CustomAttribute>(request);
        //attribute.CreatedAt = DateTime.UtcNow;
        //attribute.UpdatedAt = DateTime.UtcNow;

        await _customAttributeRepository.InsertAsync(attribute);

        var attributeValues = request.Values
            .Select(v => _mapper.Map<AttributeValue>(v))
            .ToList();

        foreach (var value in attributeValues)
        {
            value.AttributeId = attribute.Id;
        }
            if (attributeValues.Any())
            await _attributeValueRepository.InsertAsync(attributeValues);

        return attribute.Id;
    }

    public async Task UpdateCustomAttributeAsync(int id, CreateCustomAttributeRequest request)
    {
        var existingAttribute = await _customAttributeRepository.Table
            .FirstOrDefaultAsync(a => a.Id == id);

        if (existingAttribute == null)
            throw new KeyNotFoundException("Attribute not found");

        _mapper.Map(request, existingAttribute);

        await _customAttributeRepository.UpdateAsync(existingAttribute);

        await _attributeValueRepository.Table
            .Where(v => v.AttributeId == id)
            .DeleteAsync();
        var attributeValues = request.Values
                     .Select(v => _mapper.Map<AttributeValue>(v))
                     .ToList();

        foreach (var value in attributeValues)
        {
            value.AttributeId = existingAttribute.Id;
        }

        if (attributeValues.Any())
            await _attributeValueRepository.InsertAsync(attributeValues);
    }

    public async Task DeleteCustomAttributeAsync(int id)
    {
        var attribute = await _customAttributeRepository.Table
            .FirstOrDefaultAsync(a => a.Id == id);

        if (attribute == null)
            throw new KeyNotFoundException("Attribute not found");

        await _attributeValueRepository.Table
            .Where(v => v.AttributeId == id)
            .DeleteAsync();

        await _customAttributeRepository.DeleteAsync(attribute);
    }

    public async Task<int> CreateAttributeValueAsync(int attributeId, CreateAttributeValueRequest request)
    {
        var attribute = await _customAttributeRepository.Table
            .FirstOrDefaultAsync(a => a.Id == attributeId);

        if (attribute == null)
            throw new KeyNotFoundException("Attribute not found");

        var attributeValue = _mapper.Map<AttributeValue>(request);
        attributeValue.AttributeId = attributeId;
        attributeValue.CreatedAt = DateTime.UtcNow;
        attributeValue.UpdatedAt = DateTime.UtcNow;

        await _attributeValueRepository.InsertAsync(attributeValue);

        return attributeValue.Id;
    }

    public async Task UpdateAttributeValueAsync(int valueId, CreateAttributeValueRequest request)
    {
        var attributeValue = await _attributeValueRepository.Table
            .FirstOrDefaultAsync(v => v.Id == valueId);

        if (attributeValue == null)
            throw new KeyNotFoundException("Attribute value not found");

        _mapper.Map(request, attributeValue);
        attributeValue.UpdatedAt = DateTime.UtcNow;

        await _attributeValueRepository.UpdateAsync(attributeValue);
    }

    public async Task DeleteAttributeValueAsync(int valueId)
    {
        var attributeValue = await _attributeValueRepository.Table
            .FirstOrDefaultAsync(v => v.Id == valueId);

        if (attributeValue == null)
            throw new KeyNotFoundException("Attribute value not found");

        await _attributeValueRepository.DeleteAsync(attributeValue);
    }

    public async Task<CustomAttribute> GetCustomAttributeAsync(int id)
    {
        var attribute = await _customAttributeRepository.Table
            .Where(a => a.Id == id)
            .LoadWith(a => a.Values)
            .FirstOrDefaultAsync();
        return attribute;
    }


    #endregion
}
