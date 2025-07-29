using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202509)]
public class CreateBookImageTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(BookImage))
                .WithColumn(nameof(BookImage.Id)).AsInt32().PrimaryKey().Identity()
                .WithColumn(nameof(BookImage.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(BookImage.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn(nameof(BookImage.BookId)).AsInt32().NotNullable()
                .WithColumn(nameof(BookImage.ImageUrl)).AsString(500).NotNullable();

        Create.ForeignKey($"FK_{nameof(BookImage)}_{nameof(BookImage.BookId)}")
            .FromTable(nameof(BookImage)).ForeignColumn(nameof(BookImage.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));
    }
    public override void Down()
    {
    }
}
