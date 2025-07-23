using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Products;
using Backend.DTO.Products;

namespace Backend.DTO.Cart;

public class CartItemDto
{
    public int Id { get; set; }
    public int UserId { get; set; }

    public int BookId { get; set; }


    public int Quantity { get; set; }

    public decimal ItemPrice => (Book.SalePrice * Quantity) + BookAttributeValues.Sum(av => av.PriceAdjustment * Quantity);

    public BookDto Book { get; set; }

    public List<AttributeValueDto> BookAttributeValues { get; set; }

    public DateTime CreatedAt { get; set; } 

    public DateTime UpdatedAt { get; set; } 
}
