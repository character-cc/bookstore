namespace Backend.Data.Domain.Orders;

public enum ShippingStatus
{
    NotShipped = 0,  
    Shipping = 1,     
    Delivered = 2,   
    Failed = 3,       
    Returned = 4      
}