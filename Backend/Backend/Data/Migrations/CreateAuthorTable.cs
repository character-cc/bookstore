namespace Backend.Data.Migrations;

using Backend.Data.Domain.Authors;
using FluentMigrator;

[Migration(202502)]
public class CreateAuthorTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Author))
            .WithColumn(nameof(Author.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(Author.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Author.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Author.Name)).AsString(200).NotNullable()
            .WithColumn(nameof(Author.Biography)).AsString(2000).NotNullable()
            .WithColumn(nameof(Author.ImageUrl)).AsString(500).NotNullable()
            .WithColumn(nameof(Author.IsShownOnHomePage)).AsBoolean()
            .WithColumn(nameof(Author.DisplayOrder)).AsInt32();
    }

    public override void Down()
    {
        Delete.Table(nameof(Author));
    }
}
