namespace Backend.Data.Domain.Products;

public class InventoryTransaction : BaseEntity, IEntity
{

    public int OrderId { get; set; }

    public int BookId { get; set; }

    public int Quantity { get; set; }

    public int ImportBookId { get; set; }

}
