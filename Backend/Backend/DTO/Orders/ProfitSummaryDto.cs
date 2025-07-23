namespace Backend.DTO.Orders;

public class ProfitSummaryDto
{
    public decimal TotalProfit { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalBaseCost { get; set; }
    public decimal TotalShippingFee { get; set; }
    public int OrderCount { get; set; }
}
