using Backend.Data.Domain.Orders;
using Backend.DTO.Users;

namespace Backend.DTO.Orders;

public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string ShippingAddress { get; set; }


    public string TransactionId { get; set; }

    public string Status { get; set; } = "Pending";

   public string CustomerName { get; set; }

   public string CustomerPhone { get; set; }

     public string CustomerEmail { get; set; }
    public int ShippingFee { get; set; }
    public bool IsFreeShipping { get; set; }
    public string DiscountCode { get; set; }
    public decimal DiscountAmount { get; set; }

    public bool IsPaid { get; set; } 
    public decimal TotalAmount { get; set; }
        
    // Trường này để tạo ra 1 order mới nhưng có thể người dùng chưa thanh toán. Để check không hiện thị cho admin
    // khi người dùng đã thanh toán thì sẽ set IsComplete = true. Khi tạo mới sẽ xóa các order được đánh dấu là false
    public bool IsComplete { get; set; } 

    public DateTime CreatedAt { get; set; } 

    public DateTime UpdatedAt { get; set; } 
    public List<OrderItemDto> Items { get; set; } 

    public List<ShippingTrackingDto> Tracking { get; set; } 

    public UserDto User { get; set; }
}
