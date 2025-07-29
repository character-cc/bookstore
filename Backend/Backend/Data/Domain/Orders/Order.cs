using Backend.Data.Domain.Stores;
using Backend.Data.Domain.Users;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Orders;

[Table]
public class Order : BaseEntity, IEntity
{

    [Column] public int UserId { get; set; }
    [Column] public string ShippingAddress { get; set; }

    [Column] public string CustomerName { get; set; }

    [Column] public string CustomerPhone { get; set; }

    [Column] public string CustomerEmail { get; set; }
    [Column] public string TransactionId { get; set; }

    [Column] public bool IsPaid { get; set; }

    [Column] public int StoreId { get; set; } = 0; 

    [Column] public string Status { get; set; } = "Pending";

    //Đây là phí ship
    [Column] public decimal ShippingFee { get; set; }

    [Column] public int DiscountId { get; set; } = 0; 
    [Column] public string DiscountCode { get; set; }
    [Column] public decimal DiscountAmount { get; set; }

    [Column] public decimal TotalAmount { get; set; }
    
    [Column]
    public decimal TotalBaseCost { get; set; }

    [NotColumn]
    public decimal Profit => TotalAmount - TotalBaseCost - ShippingFee;
    // Trường này để tạo ra 1 order mới nhưng có thể người dùng chưa thanh toán. Để check không hiện thị cho admin
    // khi người dùng đã thanh toán thì sẽ set IsComplete = true. Khi tạo mới sẽ xóa các order được đánh dấu là false
    [Column] public bool IsComplete { get; set; } = false;
     
    [Association(ThisKey = nameof(Id), OtherKey = nameof(OrderItem.OrderId))]
    public List<OrderItem> Items { get; set; } = new();

    [Association(ThisKey = nameof(Id), OtherKey = nameof(ShippingTracking.OrderId))]
    public List<ShippingTracking> Tracking { get; set; } = new();

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(User.Id), CanBeNull = false)]
    public User User { get; set; } = null!;

    [Association(ThisKey = nameof(StoreId), OtherKey = nameof(Store.Id), CanBeNull = false)]
    public Store Store { get; set; } = null!;
}
