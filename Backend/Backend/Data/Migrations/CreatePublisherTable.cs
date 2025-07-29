namespace Backend.Data.Migrations;

using Backend.Data.Domain.Authors;
using FluentMigrator;

[Migration(202503)]
public class CreatePublisherTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Publisher))
                        .WithColumn(nameof(Publisher.Id)).AsInt32().PrimaryKey().Identity()
                        .WithColumn(nameof(Publisher.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                        .WithColumn(nameof(Publisher.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                        .WithColumn(nameof(Publisher.Name)).AsString(200).NotNullable()
                        .WithColumn(nameof(Publisher.Description)).AsString(2000).NotNullable()
                        .WithColumn(nameof(Publisher.Website)).AsString(500).NotNullable()
                        .WithColumn(nameof(Publisher.LogoUrl)).AsString(500).NotNullable();
    }

    public override void Down()
    {
        Delete.Table(nameof(Publisher));
    }
}
