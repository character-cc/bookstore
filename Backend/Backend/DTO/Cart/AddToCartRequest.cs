namespace Backend.DTO.Cart;

public class AddToCartRequest
{
   
    public int BookId { get; set; }
  
    public int Quantity { get; set; }

    public List<int> AttributeValueIds { get; set; } 
}
