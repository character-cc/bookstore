using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Users;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202515)]
public class AddOrderAndCheckoutTables : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Order))
              .WithColumn(nameof(Order.Id)).AsInt32().PrimaryKey().Identity()
              .WithColumn(nameof(Order.UserId)).AsInt32().NotNullable()
              .WithColumn(nameof(Order.ShippingAddress)).AsString().Nullable()
              .WithColumn(nameof(Order.TransactionId)).AsString().NotNullable()
              .WithColumn(nameof(Order.IsComplete)).AsBoolean().NotNullable().WithDefaultValue(false)
              .WithColumn(nameof(Order.Status)).AsString().NotNullable()
              .WithColumn(nameof(Order.IsPaid)).AsBoolean().NotNullable().WithDefaultValue(false)
              .WithColumn(nameof(Order.CustomerName)).AsString(500).NotNullable()
              .WithColumn(nameof(Order.CustomerPhone)).AsString(50).NotNullable()
              .WithColumn(nameof(Order.StoreId)).AsInt32().NotNullable().WithDefaultValue(0) 
              .WithColumn(nameof(Order.CustomerEmail)).AsString(500).Nullable()
              .WithColumn(nameof(Order.ShippingFee)).AsDecimal().NotNullable()
              .WithColumn(nameof(Order.DiscountId)).AsInt32().NotNullable().WithDefaultValue(0) 
              .WithColumn(nameof(Order.DiscountCode)).AsString(100).Nullable()
              .WithColumn(nameof(Order.TotalBaseCost)).AsDecimal().NotNullable().WithDefaultValue(0)
              .WithColumn(nameof(Order.DiscountAmount)).AsDecimal().NotNullable().WithDefaultValue(0)
              .WithColumn(nameof(Order.TotalAmount)).AsDecimal().NotNullable()
              .WithColumn(nameof(Order.CreatedAt)).AsDateTime().NotNullable()
              .WithColumn(nameof(Order.UpdatedAt)).AsDateTime().NotNullable();

        Create.Table(nameof(OrderItem))
            .WithColumn(nameof(OrderItem.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(OrderItem.OrderId)).AsInt32().NotNullable()
            .WithColumn(nameof(OrderItem.BookId)).AsInt32().NotNullable()
            .WithColumn(nameof(OrderItem.BookName)).AsString(500).NotNullable()
            .WithColumn(nameof(OrderItem.PictureUrl)).AsString(1000).Nullable()
            .WithColumn(nameof(OrderItem.ShortDescription)).AsString(1000).Nullable()
            .WithColumn(nameof(OrderItem.TotalCostPrice)).AsDecimal().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(OrderItem.SelectedAttributes)).AsString(int.MaxValue).Nullable()
            .WithColumn(nameof(OrderItem.Quantity)).AsInt32().NotNullable()
            .WithColumn(nameof(OrderItem.UnitPrice)).AsDecimal().NotNullable()
            .WithColumn(nameof(OrderItem.CreatedAt)).AsDateTime().NotNullable()
            .WithColumn(nameof(OrderItem.UpdatedAt)).AsDateTime().NotNullable();

        Create.Table(nameof(ShippingTracking))
               .WithColumn(nameof(ShippingTracking.Id)).AsInt32().PrimaryKey().Identity()
               .WithColumn(nameof(ShippingTracking.OrderId)).AsInt32().NotNullable()
               .WithColumn(nameof(ShippingTracking.TrackingCode)).AsString(100).NotNullable()
               .WithColumn(nameof(ShippingTracking.Provider)).AsString(100).NotNullable()
               .WithColumn(nameof(ShippingTracking.Status)).AsString().NotNullable()
                .WithColumn(nameof(ShippingTracking.CreatedAt)).AsDateTime().NotNullable()
               .WithColumn(nameof(ShippingTracking.UpdatedAt)).AsDateTime().NotNullable();

        Create.Table(nameof(CheckoutItem))
              .WithColumn(nameof(CheckoutItem.Id)).AsInt32().PrimaryKey().Identity()
              .WithColumn(nameof(CheckoutItem.UserId)).AsInt32().NotNullable()
              .WithColumn(nameof(CheckoutItem.DiscountId)).AsInt32().Nullable()
              .WithColumn(nameof(CheckoutItem.CartItemId)).AsInt32().NotNullable()
              .WithColumn(nameof(CheckoutItem.CreatedAt)).AsDateTime().NotNullable()
              .WithColumn(nameof(CheckoutItem.UpdatedAt)).AsDateTime().NotNullable();

        Create.ForeignKey()
            .FromTable(nameof(Order)).ForeignColumn(nameof(Order.UserId))
            .ToTable(nameof(User)).PrimaryColumn(nameof(User.Id));

        Create.ForeignKey()
            .FromTable(nameof(CheckoutItem)).ForeignColumn(nameof(CheckoutItem.UserId))
            .ToTable(nameof(User)).PrimaryColumn(nameof(User.Id));

        Create.ForeignKey()
            .FromTable(nameof(CheckoutItem)).ForeignColumn(nameof(CheckoutItem.CartItemId))
            .ToTable(nameof(CartItem)).PrimaryColumn(nameof(CartItem.Id)).OnDelete(System.Data.Rule.Cascade);

        Create.ForeignKey()
              .FromTable(nameof(OrderItem)).ForeignColumn(nameof(OrderItem.OrderId))
              .ToTable(nameof(Order)).PrimaryColumn(nameof(Order.Id)).OnDelete(System.Data.Rule.Cascade).OnDelete(System.Data.Rule.Cascade);

        Create.ForeignKey()
                .FromTable(nameof(OrderItem)).ForeignColumn(nameof(OrderItem.BookId))
                .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));

        Create.ForeignKey()
              .FromTable(nameof(ShippingTracking)).ForeignColumn(nameof(ShippingTracking.OrderId))
              .ToTable(nameof(Order)).PrimaryColumn(nameof(Order.Id));


    }
    public override void Down()
    {

    }
}
