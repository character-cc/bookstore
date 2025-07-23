namespace Backend.Data.Domain.Orders;

public enum OrderStatus
{
    Pending = 0,
    Shipping = 2,
    Processing = 3,
    Completed = 4,   
    Cancelled = 5  
}
