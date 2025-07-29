namespace Backend.DTO.Orders;

public class UpdateOrderRequest
{

    public string Status { get; set; }

    public List<ShippingTrackingDto> ShippingTrackings { get; set; }
}
