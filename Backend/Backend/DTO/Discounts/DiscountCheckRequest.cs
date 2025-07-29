namespace Backend.DTO.Discounts;

public class DiscountCheckRequest
{
    public string DiscountCode { get; set; }
    public List<int> CartItemIds { get; set; } 
}
