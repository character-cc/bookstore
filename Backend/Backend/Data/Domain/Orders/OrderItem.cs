using LinqToDB.Mapping;

namespace Backend.Data.Domain.Orders;

public class OrderItem : BaseEntity, IEntity
{
    [Column] public int OrderId { get; set; }
    [Column] public int BookId { get; set; }
    [Column] public string BookName { get; set; } = null!;
    [Column] public string PictureUrl { get; set; }
    [Column] public string ShortDescription { get; set; }
    [Column] public string SelectedAttributes { get; set; }

    [Column]
    public decimal TotalCostPrice { get; set; }
    [Column] public int Quantity { get; set; }
    [Column] public decimal UnitPrice { get; set; }

    [Association(ThisKey  = nameof(OrderId), OtherKey = nameof(Order.Id), CanBeNull = false)]
    public Order Order { get; set; } = null!;

}
