
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Cart;

[Table]
public class CartItemAttribute : BaseEntity, IEntity
{
    [Column]
    public int CartItemId { get; set; }

    [Column]
    public int BookAttributeValueId { get; set; }

}
