using Backend.Data;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Stores;
using Backend.Services.Products;
using LinqToDB;

namespace Backend.Services.Cart;

public class CartService : ICartService
{
    private readonly IRepository<CartItem> _cartItemRepository;

    private readonly IRepository<CartItemAttribute> _cartItemAttributeRepository;

    private readonly IRepository<StoreBook> _storeBookRepository;

    private readonly IBookService _bookService;



    public CartService(
        IRepository<CartItem> cartItemRepository,
        IRepository<CartItemAttribute> cartItemAttributeRepository,
        IRepository<StoreBook> storeBookRepository,
        IBookService bookService)
    {
        _cartItemRepository = cartItemRepository ?? throw new ArgumentNullException(nameof(cartItemRepository));
        _cartItemAttributeRepository = cartItemAttributeRepository ?? throw new ArgumentNullException(nameof(cartItemAttributeRepository));
        _storeBookRepository = storeBookRepository ?? throw new ArgumentNullException(nameof(storeBookRepository));
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService));
    }

    public async Task DeleteCartItemAsync(int cartItemId)
    {
        if (cartItemId <= 0)
            throw new ArgumentException("ID giỏ hàng không hợp lệ", nameof(cartItemId));
        var cartItem = await _cartItemRepository.EntitySet
            .Where(ci => ci.Id == cartItemId)
            .FirstOrDefaultAsync();
        await _cartItemRepository.DeleteAsync(cartItem);
    }
    public async Task<bool> AddToCartAsync(int currentUserId, int bookId, int quantity, List<int> attributeValueIds)
    {
        if (quantity <= 0)
            throw new ArgumentException("Số lượng phải lớn hơn 0", nameof(quantity));

        if (bookId <= 0)
            throw new ArgumentException("ID sách không hợp lệ", nameof(bookId));

        var book = await _bookService.GetBookAsync(bookId);
        if ((book.InventoryManagementMethodType == InventoryManagementMethodType.SimpleTracking))
        {
            if(quantity > await _bookService.GetStockQuantityAsync(book.Id))
                return false;
        }
        //else if (book.InventoryManagementMethodType == InventoryManagementMethodType.StoreTracking)
        //{
        //    var hasAvailableStore = await _storeBookRepository.EntitySet
        //        .AnyAsync(sb => sb.BookId == book.Id && sb.Quantity >= quantity);

        //    if (!hasAvailableStore)
        //        return false;
        //}

        var query = _cartItemRepository.EntitySet;

        var cartItems = await query
            .Where(ci => ci.UserId == currentUserId && ci.BookId == bookId)
            .ToListAsync();

        CartItem matchedItem = null;

        foreach (var item in cartItems)
        {
            var itemAttributeIds = await _cartItemAttributeRepository.EntitySet
                .Where(a => a.CartItemId == item.Id)
                .Select(a => a.BookAttributeValueId)
                .ToListAsync();

            bool isSameAttributes = itemAttributeIds.Count == attributeValueIds.Count &&
                                    !itemAttributeIds.Except(attributeValueIds).Any();

            if (isSameAttributes)
            {
                matchedItem = item;
                break;
            }
        }

        if (matchedItem != null)
        {
            matchedItem.Quantity += quantity;
            await _cartItemRepository.UpdateAsync(matchedItem);
        }
        else
        {
            var newItem = new CartItem
            {
                UserId = currentUserId,
                BookId = bookId,
                Quantity = quantity
            };
            await _cartItemRepository.InsertAsync(newItem);

            foreach (var attrValueId in attributeValueIds)
            {
                var attribute = new CartItemAttribute
                {
                    CartItemId = newItem.Id,
                    BookAttributeValueId = attrValueId
                };
                await _cartItemAttributeRepository.InsertAsync(attribute);
            }
        }
        return true;
    }

    public async Task<IList<CartItem>> GetCartItemsAsync(int userId)
    {
        if (userId <= 0)
            throw new ArgumentException("ID người dùng không hợp lệ", nameof(userId));
        var query = _cartItemRepository.EntitySet
            .LoadWith(ci => ci.Book).ThenLoad(b => b.Images)
            .LoadWith(ci => ci.Book).ThenLoad(b => b.Authors)
            .LoadWith(ci => ci.BookAttributeValues)
            .Where(ci => ci.UserId == userId)
            .OrderByDescending(ci => ci.UpdatedAt);
        var cartItems = query.ToListAsync();
        var result = new List<CartItem>();
        foreach (var item in await cartItems)
        {
            if(item.Book.InventoryManagementMethodType == InventoryManagementMethodType.SimpleTracking)
            {
                var stockQuantity = await _bookService.GetStockQuantityAsync(item.BookId);
                if (item.Quantity > stockQuantity)
                {
                    item.Quantity = stockQuantity; 
                    if(item.Quantity <= 0)
                    {
                        await _cartItemRepository.DeleteAsync(item);
                        continue; 
                    }
                    else
                    {
                        await _cartItemRepository.UpdateAsync(item);
                    }
                    
                }   
                result.Add(item);
            }
            else
            {
                result.Add(item);
            }
        }
        return result;
    }

    public async Task<bool> UpdateQuantityCartAsync(int cartItemId, int quantity)
    {
        if (cartItemId <= 0)
            throw new ArgumentException("ID giỏ hàng không hợp lệ", nameof(cartItemId));
        if (quantity <= 0)
            throw new ArgumentException("Số lượng phải lớn hơn 0", nameof(quantity));
        var cartItem = await _cartItemRepository.EntitySet.LoadWith(ci => ci.Book).ThenLoad(b => b.Images)
            .LoadWith(ci => ci.Book).ThenLoad(b => b.Authors)
            .LoadWith(ci => ci.BookAttributeValues).Where(ci => ci.Id == cartItemId).FirstOrDefaultAsync();
        if (cartItem == null)
            throw new KeyNotFoundException("Không tìm thấy giỏ hàng với ID đã cho");
        if (cartItem.Book.InventoryManagementMethodType == InventoryManagementMethodType.SimpleTracking)
        {
            var stockQuantity = await _bookService.GetStockQuantityAsync(cartItem.BookId);
            if (quantity > stockQuantity)
            {
                return false;
            }
            
        }  
        cartItem.Quantity = quantity;
        await _cartItemRepository.UpdateAsync(cartItem);
        return true;

    }

    public async Task<List<CartItem>> GetCartItemsByIdsAsync(int userId, List<int> cartItemIds)
    {
        if (userId <= 0)
            throw new ArgumentException("ID người dùng không hợp lệ", nameof(userId));
        if (cartItemIds == null || !cartItemIds.Any())
            throw new ArgumentException("Danh sách ID giỏ hàng không hợp lệ", nameof(cartItemIds));
        return await _cartItemRepository.EntitySet.LoadWith(ci => ci.Book).LoadWith(ci => ci.BookAttributeValues)
            .LoadWith(ci => ci.CartItemAttributes)
            .Where(ci => ci.UserId == userId && cartItemIds.Contains(ci.Id))
            .ToListAsync();
    }
}
