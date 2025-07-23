using Backend.Data.Domain.Orders;

namespace Backend.DTO.Orders;

public class OrderItemDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int BookId { get; set; }
    public string BookName { get; set; } = null!;
    public string PictureUrl { get; set; }
    public string ShortDescription { get; set; }
    public string SelectedAttributes { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

}
