using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Stores;
using Backend.Data.Domain.Users;
using FluentMigrator;
using static LinqToDB.Reflection.Methods.LinqToDB;

namespace Backend.Data.Migrations;

[Migration(0)]
public class DropAllTables : Migration
{
    public override void Up()
    {
        Delete.Table(nameof(UserRole));
        Delete.Table(nameof(Address));
        Delete.Table(nameof(EmailOtp));
        Delete.Table(nameof(InventoryTransaction));
        Delete.Table(nameof(StoreBook));
        Delete.Table(nameof(ImportBook));
        Delete.Table(nameof(Store));
        Delete.Table(nameof(CheckoutItem));
        Delete.Table(nameof(ShippingTracking));
        Delete.Table(nameof(OrderItem));
        Delete.Table(nameof(Order));
        Delete.Table(nameof(DiscountRole));
        Delete.Table(nameof(ApplicableDiscountBook));
        Delete.Table(nameof(ExcludedDiscountBook));
        Delete.Table(nameof(CartItemAttribute));
        Delete.Table(nameof(CartItem));
        Delete.Table(nameof(Discount));
        Delete.Table(nameof(User));
        Delete.Table(nameof(Role));
        Delete.Table(nameof(BookAuthor));
        Delete.Table(nameof(BookCategory));
        Delete.Table(nameof(BookImage));
        Delete.Table(nameof(BookPublisher));
        Delete.Table(nameof(AttributeCombination));
        Delete.Table(nameof(AttributeValue));
        Delete.Table(nameof(CustomAttribute));
        Delete.Table(nameof(Publisher));
        Delete.Table(nameof(Author));
        Delete.Table(nameof(Category));
        Delete.Table(nameof(Book));
        Execute.Sql(@"
                DELETE FROM dbo.versionInfo;");

    }

    public override void Down()
    {
    }
}

