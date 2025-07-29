using System.Linq.Expressions;
using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Products.Enum;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class Book : BaseEntity, IEntity , ISoftDelete
{
    [Column, NotNull]
    public string Name { get; set; } = string.Empty;

    [Column, NotNull]
    public string Isbn { get; set; } = string.Empty;

    [Column]
    public decimal CostPrice { get; set; } = 0;

    [Column]
    public int InitialStockQuantity { get; set; } = 0;

    [Column]
    public int Weight { get; set; } = 0;

    [Column]
    public int Length { get; set; } = 0;

    [Column]
    public int Width { get; set; } = 0;

    [Column]
    public int Height { get; set; } = 0;

    [Column]
    public decimal OriginalPrice { get; set; } = 0;

    [Column]
    public decimal SalePrice { get; set; } = 0;

    [Column]
    public bool Published { get; set; } = true;


    [Column, NotNull]
    public string ShortDescription { get; set; } = string.Empty;

    [Column, NotNull]
    public string FullDescription { get; set; } = string.Empty;

    [Column]
    public string Language{ get; set; } = string.Empty;

    [Column]
    public bool IsDeleted { get; set; } = false;

    [Column]
    public bool IsGift { get; set; } = false;

    [Column]
    public int PageCount { get; set; } = 0;


    [Column]
    public int InventoryManagementMethodId { get; set; }

    [Column]
    public DateTime PublishedDate { get; set; }  = DateTime.UtcNow;

    [Column]
    public int StockQuantity { get; set; } = 0;

    [Column]
    public int LowStockThreshold { get; set; } = 0;

    [Column]
    public bool MarkAsBestseller { get; set; }

    [Column]
    public bool MarkAsNew { get; set; }

    [Column]
    public bool IsShowAsNewOnHome { get; set; }

    [Column]
    public bool IsShowAsBestsellerOnHome { get; set; }

    [Column]
    public int DisplayOrderBestseller { get; set; } = 0;

    [Column]
    public int DisplayOrderAsNew { get; set; } = 0;

    [Column]
    public int DisplayOrderAsSale { get; set; } = 0;


    [Association(ThisKey = nameof(Id), OtherKey = nameof(BookImage.BookId), CanBeNull = false)]
    public List<BookImage> Images { get; set; } = new List<BookImage>();

    [Association(ThisKey = nameof(Id), OtherKey = nameof(CustomAttribute.BookId), CanBeNull = false)]
    public List<CustomAttribute> CustomAttributes { get; set; } = new List<CustomAttribute>();

    [Association(ThisKey = nameof(Id), OtherKey = nameof(AttributeCombination.BookId), CanBeNull = false)]
    public List<AttributeCombination> AttributeCombinations { get; set; } = new List<AttributeCombination>();





    [Association(ThisKey = nameof(Id), OtherKey = nameof(BookAuthor.BookId), CanBeNull = false)]
    public List<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();

    [Association(ThisKey = nameof(Id), OtherKey = nameof(BookCategory.BookId), CanBeNull = false)]
    public List<BookCategory> BookCategories { get; set; } = new List<BookCategory>();

    [Association(ThisKey = nameof(Id), OtherKey = nameof(BookPublisher.BookId), CanBeNull = false)]
    public List<BookPublisher> BookPublishers { get; set; } = new List<BookPublisher>();


    public static Expression<Func<Book, Category, bool>> CategoryExpression => (book, category) =>
        book.BookCategories.Any(bc => bc.CategoryId == category.Id);

    public static Expression<Func<Book, Author, bool>> AuthorExpression => (book, author) =>
        book.BookAuthors.Any(ba => ba.AuthorId == author.Id);

    public static Expression<Func<Book, Publisher, bool>> PublisherExpression => (book, publisher) =>
        book.BookPublishers.Any(bp => bp.PublisherId == publisher.Id);

    [Association(ExpressionPredicate = nameof(CategoryExpression))]
    public List<Category> Categories { get; set; } = new List<Category>();

    [Association(ExpressionPredicate = nameof(AuthorExpression))]
    public List<Author> Authors { get; set; } = new List<Author>();

    [Association(ExpressionPredicate = nameof(PublisherExpression))]
    public List<Publisher> Publishers { get; set; } = new List<Publisher>();



    [NotColumn]
    public InventoryManagementMethodType InventoryManagementMethodType
    {
        get => (InventoryManagementMethodType)InventoryManagementMethodId;
        set => InventoryManagementMethodId = (int)value;
    }

}
