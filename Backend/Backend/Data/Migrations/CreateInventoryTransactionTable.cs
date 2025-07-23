using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202520)]
public class CreateInventoryTransactionTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(InventoryTransaction))
            .WithColumn(nameof(BaseEntity.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(InventoryTransaction.OrderId)).AsInt32().NotNullable()
            .WithColumn(nameof(InventoryTransaction.BookId)).AsInt32().NotNullable()
            .WithColumn(nameof(InventoryTransaction.Quantity)).AsInt32().NotNullable()
            .WithColumn(nameof(InventoryTransaction.ImportBookId)).AsInt32().NotNullable()
            .WithColumn(nameof(BaseEntity.CreatedAt)).AsDateTime().Nullable()
            .WithColumn(nameof(BaseEntity.UpdatedAt)).AsDateTime().Nullable();

        Create.ForeignKey()
            .FromTable(nameof(InventoryTransaction)).ForeignColumn(nameof(InventoryTransaction.ImportBookId))
            .ToTable(nameof(ImportBook)).PrimaryColumn(nameof(ImportBook.Id))
            .OnDelete(System.Data.Rule.Cascade);

        Create.ForeignKey()
            .FromTable(nameof(InventoryTransaction)).ForeignColumn(nameof(InventoryTransaction.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id)); 

        Create.ForeignKey()
            .FromTable(nameof(InventoryTransaction)).ForeignColumn(nameof(InventoryTransaction.OrderId))
            .ToTable(nameof(Order)).PrimaryColumn(nameof(Order.Id));


    }
    public override void Down()
    {
    }
}
