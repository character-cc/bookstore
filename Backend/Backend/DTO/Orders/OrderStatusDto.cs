namespace Backend.DTO.Orders;

public class OrderStatusDto
{
    public int Pending { get; set; }
    public int Shipping { get; set; }
    public int Processing { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
}
