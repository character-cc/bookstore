using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Users;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202512)]
public class CreateCardTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(CartItem))
             .WithColumn(nameof(CartItem.Id)).AsInt32().PrimaryKey().Identity()
             .WithColumn(nameof(CartItem.UserId)).AsInt32().NotNullable()
             .WithColumn(nameof(CartItem.BookId)).AsInt32().NotNullable()
             .WithColumn(nameof(CartItem.Quantity)).AsInt32().NotNullable()
             .WithColumn(nameof(CartItem.CreatedAt)).AsDateTime().NotNullable()
             .WithColumn(nameof(CartItem.UpdatedAt)).AsDateTime().NotNullable();

        Create.Table(nameof(CartItemAttribute))
            .WithColumn(nameof(CartItemAttribute.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(CartItemAttribute.CartItemId)).AsInt32().NotNullable()
            .WithColumn(nameof(CartItemAttribute.BookAttributeValueId)).AsInt32().NotNullable()
            .WithColumn(nameof(CartItemAttribute.CreatedAt)).AsDateTime().NotNullable()
             .WithColumn(nameof(CartItemAttribute.UpdatedAt)).AsDateTime().NotNullable();

        Create.ForeignKey().FromTable(nameof(CartItem)).ForeignColumn(nameof(CartItem.BookId)).ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));
        Create.ForeignKey().FromTable(nameof(CartItem)).ForeignColumns(nameof(CartItem.UserId)).ToTable(nameof(User)).PrimaryColumn(nameof(User.Id));
        Create.ForeignKey().FromTable(nameof(CartItemAttribute)).ForeignColumn(nameof(CartItemAttribute.CartItemId)).ToTable(nameof(CartItem)).PrimaryColumn(nameof(CartItem.Id)).OnDelete(System.Data.Rule.Cascade);
        Create.ForeignKey().FromTable(nameof(CartItemAttribute)).ForeignColumn(nameof(CartItemAttribute.BookAttributeValueId)).ToTable(nameof(AttributeValue)).PrimaryColumn(nameof(AttributeValue.Id)).OnDelete(System.Data.Rule.Cascade);
    }
    public override void Down()
    {
     
    }
}
