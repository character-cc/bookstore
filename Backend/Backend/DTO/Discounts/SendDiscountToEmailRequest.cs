namespace Backend.DTO.Discounts;

public class SendDiscountToEmailRequest
{
    public int DiscountId { get; set; } = 0;
    
    public List<int> UserIds { get; set; } = new List<int>();
}
