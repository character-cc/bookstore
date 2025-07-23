using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202505)]
public class CreateAttributeCombinationTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(AttributeCombination))
                .WithColumn(nameof(AttributeCombination.Id)).AsInt32().PrimaryKey().Identity()
                .WithColumn(nameof(AttributeCombination.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(AttributeCombination.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(AttributeCombination.BookId)).AsInt32().NotNullable()
                .WithColumn(nameof(AttributeCombination.AttributesJson)).AsString(int.MaxValue).NotNullable()
                .WithColumn(nameof(AttributeCombination.Sku)).AsString(500).NotNullable()
                .WithColumn(nameof(AttributeCombination.Price)).AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn(nameof(AttributeCombination.LowStockThreshold)).AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn(nameof(AttributeCombination.StockQuantity)).AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn(nameof(AttributeCombination.IsActive)).AsBoolean().NotNullable().WithDefaultValue(true);

        Create.ForeignKey($"FK_{nameof(AttributeCombination)}_{nameof(AttributeCombination.BookId)}")
            .FromTable(nameof(AttributeCombination)).ForeignColumn(nameof(AttributeCombination.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));
    }
    public override void Down()
    {
    }
}
