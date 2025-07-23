namespace Backend.DTO.Checkouts;

public class CheckoutRequest
{

    public List<int> CartItemIds { get; set; } = new List<int>();

    public string DiscountCode { get; set; } = string.Empty;
}
