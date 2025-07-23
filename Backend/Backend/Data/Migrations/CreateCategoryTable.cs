using Backend.Data.Domain.Categories;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202501)]
public class CreateCategoryTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Category))
                .WithColumn(nameof(Category.Id)).AsInt32().PrimaryKey().Identity()
                .WithColumn(nameof(Category.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(Category.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(Category.Name)).AsString(200).NotNullable()
                .WithColumn(nameof(Category.Description)).AsString(2000).NotNullable()
                .WithColumn(nameof(Category.ImageUrl)).AsString(500).NotNullable()
                .WithColumn(nameof(Category.ParentId)).AsInt32().Nullable()
                .WithColumn(nameof(Category.IsShowOnHomepage)).AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn(nameof(Category.HomepageDisplayOrder)).AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn(nameof(Category.IsShowOnNavigationBar)).AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn(nameof(Category.NavigationDisplayOrder)).AsInt32().NotNullable().WithDefaultValue(0);

        Create.ForeignKey($"FK_{nameof(Category)}_{nameof(Category.ParentId)}")
            .FromTable(nameof(Category)).ForeignColumn(nameof(Category.ParentId))
            .ToTable(nameof(Category)).PrimaryColumn(nameof(Category.Id));
    }

    public override void Down()
    {

    }

}
