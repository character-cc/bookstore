using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

public class BookMapping : Migration
{
    public override void Up()
    {
        Create.Table(nameof(BookAuthor))
                 .WithColumn(nameof(BookAuthor.BookId)).AsInt32().NotNullable()
                 .WithColumn(nameof(BookAuthor.AuthorId)).AsInt32().NotNullable();

        Create.PrimaryKey($"PK_{nameof(BookAuthor)}")
            .OnTable(nameof(BookAuthor))
            .Columns(nameof(BookAuthor.BookId), nameof(BookAuthor.AuthorId));

        Create.ForeignKey($"FK_{nameof(BookAuthor)}_{nameof(BookAuthor.BookId)}")
            .FromTable(nameof(BookAuthor)).ForeignColumn(nameof(BookAuthor.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));

        Create.ForeignKey($"FK_{nameof(BookAuthor)}_{nameof(BookAuthor.AuthorId)}")
            .FromTable(nameof(BookAuthor)).ForeignColumn(nameof(BookAuthor.AuthorId))
            .ToTable(nameof(Author)).PrimaryColumn(nameof(Author.Id))
            .OnDelete(System.Data.Rule.Cascade);

        Create.Table(nameof(BookCategory))
            .WithColumn(nameof(BookCategory.BookId)).AsInt32().NotNullable()
            .WithColumn(nameof(BookCategory.CategoryId)).AsInt32().NotNullable();

        Create.PrimaryKey($"PK_{nameof(BookCategory)}")
            .OnTable(nameof(BookCategory))
            .Columns(nameof(BookCategory.BookId), nameof(BookCategory.CategoryId));

        Create.ForeignKey($"FK_{nameof(BookCategory)}_{nameof(BookCategory.BookId)}")
            .FromTable(nameof(BookCategory)).ForeignColumn(nameof(BookCategory.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));

        Create.ForeignKey($"FK_{nameof(BookCategory)}_{nameof(BookCategory.CategoryId)}")
            .FromTable(nameof(BookCategory)).ForeignColumn(nameof(BookCategory.CategoryId))
            .ToTable(nameof(Category)).PrimaryColumn(nameof(Category.Id)).OnDelete(System.Data.Rule.Cascade);

        Create.Table(nameof(BookPublisher))
            .WithColumn(nameof(BookPublisher.BookId)).AsInt32().NotNullable()
            .WithColumn(nameof(BookPublisher.PublisherId)).AsInt32().NotNullable();

        Create.PrimaryKey($"PK_{nameof(BookPublisher)}")
            .OnTable(nameof(BookPublisher))
            .Columns(nameof(BookPublisher.BookId), nameof(BookPublisher.PublisherId));

        Create.ForeignKey($"FK_{nameof(BookPublisher)}_{nameof(BookPublisher.BookId)}")
            .FromTable(nameof(BookPublisher)).ForeignColumn(nameof(BookPublisher.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));

        Create.ForeignKey($"FK_{nameof(BookPublisher)}_{nameof(BookPublisher.PublisherId)}")
            .FromTable(nameof(BookPublisher)).ForeignColumn(nameof(BookPublisher.PublisherId))
            .ToTable(nameof(Publisher)).PrimaryColumn(nameof(Publisher.Id)).OnDelete(System.Data.Rule.Cascade);
    }
    public override void Down()
    {
      
    }
}
