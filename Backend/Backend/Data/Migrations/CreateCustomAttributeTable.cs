using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202506)]
public class CreateCustomAttributeTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(CustomAttribute))
                  .WithColumn(nameof(CustomAttribute.Id)).AsInt32().PrimaryKey().Identity()
                  .WithColumn(nameof(CustomAttribute.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                  .WithColumn(nameof(CustomAttribute.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                  .WithColumn(nameof(CustomAttribute.BookId)).AsInt32().NotNullable()
                  .WithColumn(nameof(CustomAttribute.Name)).AsString(100).NotNullable()
                  .WithColumn(nameof(CustomAttribute.CustomAttributeTypeId)).AsInt32().NotNullable()
                  .WithColumn(nameof(CustomAttribute.Tooltip)).AsString(100).Nullable()
                  .WithColumn(nameof(CustomAttribute.DisplayOrder)).AsInt32()
                  .WithColumn(nameof(CustomAttribute.IsRequired)).AsBoolean();

        Create.ForeignKey($"FK_{nameof(CustomAttribute)}_{nameof(CustomAttribute.BookId)}")
            .FromTable(nameof(CustomAttribute)).ForeignColumn(nameof(CustomAttribute.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));
    }
    public override void Down()
    {
        Delete.Table(nameof(CustomAttribute));
    }
}
