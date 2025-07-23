using System.Linq.Expressions;
using Backend.Data.Domain.Products;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Cart;

[Table]
public class CartItem : BaseEntity, IEntity
{
    [Column]
    public int UserId { get; set; }

    [Column]
    public int BookId { get; set; }


    [NotColumn]
    public decimal ItemPrice => (Book.SalePrice ) + BookAttributeValues.Sum(av => av.PriceAdjustment);

    [NotColumn]
    public decimal BookAttributePriceAdjustment => BookAttributeValues.Sum(av => av.PriceAdjustment * Quantity);

    [Column]
    public int Quantity { get; set; }

    [Association(ThisKey = nameof(BookId), OtherKey = nameof(Book.Id))]
    public Book Book { get; set; }

    [Association(ThisKey = nameof(CartItem.Id), OtherKey = nameof(CartItemAttribute.CartItemId))]

    public List<CartItemAttribute> CartItemAttributes { get; set; } = new List<CartItemAttribute>();



    [Association(ExpressionPredicate = nameof(BookAttributeValueExpression))]
    public List<AttributeValue> BookAttributeValues { get; set; }

    public static Expression<Func<CartItem, AttributeValue, bool>> BookAttributeValueExpression =>
        (cart, attrValue) => cart.CartItemAttributes.Any(x => x.BookAttributeValueId == attrValue.Id);



}
