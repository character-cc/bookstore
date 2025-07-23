using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202507)]
public class CreateAttributeValueTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(AttributeValue))
                .WithColumn(nameof(AttributeValue.Id)).AsInt32().PrimaryKey().Identity()
                .WithColumn(nameof(AttributeValue.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(AttributeValue.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(AttributeValue.AttributeId)).AsInt32().NotNullable()
                .WithColumn(nameof(AttributeValue.Value)).AsString(100).NotNullable()
                .WithColumn(nameof(AttributeValue.Label)).AsString(100).NotNullable()
                .WithColumn(nameof(AttributeValue.PriceAdjustment)).AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
                .WithColumn(nameof(AttributeValue.IsPreSelected)).AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn(nameof(AttributeValue.DisplayOrder)).AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn(nameof(AttributeValue.IsVariant)).AsBoolean().NotNullable().WithDefaultValue(false);

        Create.ForeignKey($"FK_{nameof(AttributeValue)}_{nameof(AttributeValue.AttributeId)}")
            .FromTable(nameof(AttributeValue)).ForeignColumn(nameof(AttributeValue.AttributeId))
            .ToTable(nameof(CustomAttribute)).PrimaryColumn(nameof(CustomAttribute.Id))
            .OnDelete(System.Data.Rule.Cascade);
    }
    public override void Down()
    {
    }
}
