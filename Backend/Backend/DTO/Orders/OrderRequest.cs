using Backend.Services.Shipping;

namespace Backend.DTO.Orders;

public class OrderRequest : ShippingFeeResult
{
    public int AddressId { get; set; }


}
