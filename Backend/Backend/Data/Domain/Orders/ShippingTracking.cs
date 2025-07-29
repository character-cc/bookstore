using LinqToDB.Mapping;

namespace Backend.Data.Domain.Orders;

public class ShippingTracking : BaseEntity, IEntity
{
    [Column] public int OrderId { get; set; }
    [Column] public string TrackingCode { get; set; } = null!;
    [Column] public string Provider { get; set; } = null!;
    [Column] public string Status { get; set; }

}
