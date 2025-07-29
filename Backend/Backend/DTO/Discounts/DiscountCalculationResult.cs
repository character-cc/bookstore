namespace Backend.DTO.Discounts;

public class DiscountCalculationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = "";

    public string DiscountCode { get; set; } = "";
    public decimal TotalBeforeDiscount { get; set; }      
    public decimal DiscountableAmount { get; set; }     
    public decimal DiscountAmount { get; set; }           
    public decimal TotalAfterDiscount => TotalBeforeDiscount - DiscountAmount;
}
