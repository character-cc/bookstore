using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Data.Domain.Orders;

public class CheckoutItem : BaseEntity, IEntity
{
    [Column] public int UserId { get; set; }
    [Column] public int CartItemId { get; set; }

    [Column] public int DiscountId { get; set; }
}
