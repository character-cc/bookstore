
using Backend.Data.Domain.Products;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Stores;

[Table]
public class StoreBook : BaseEntity
{
    [Column, NotNull]
    public int StoreId { get; set; }

    [Column, NotNull]
    public int BookId { get; set; }

    [Column, NotNull]
    public int Quantity { get; set; } = 0;

    [Column, NotNull]
    public int LowStockThreshold { get; set; } = 0;

    [Association(ThisKey = nameof(StoreId), OtherKey = nameof(Stores.Store.Id), CanBeNull = false)]
    public Store Store { get; set; }

    [Association(ThisKey = nameof(BookId), OtherKey = nameof(Products.Book.Id), CanBeNull = false)]
    public Book Book { get; set; }
}