using Backend.Data.Domain.Orders;

namespace Backend.DTO.Orders;

public class ShippingTrackingDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string TrackingCode { get; set; } = null!;
    public string Provider { get; set; } = null!;
    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
