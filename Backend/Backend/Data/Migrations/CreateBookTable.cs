using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Products;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202504)]
public class CreateBookTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Book))
            .WithColumn(nameof(Book.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(Book.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Book.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Book.Name)).AsString(200).NotNullable()
            .WithColumn(nameof(Book.Isbn)).AsString(20).NotNullable()
            .WithColumn(nameof(Book.InitialStockQuantity)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.Weight)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.Length)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.Width)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.Height)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.PublishedDate)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Book.CostPrice)).AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.OriginalPrice)).AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.SalePrice)).AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.Published)).AsBoolean().NotNullable().WithDefaultValue(true)
            .WithColumn(nameof(Book.ShortDescription)).AsString(500).NotNullable()
            .WithColumn(nameof(Book.FullDescription)).AsString(4000).NotNullable()
            .WithColumn(nameof(Book.Language)).AsString().NotNullable()
            .WithColumn(nameof(Book.IsDeleted)).AsBoolean().NotNullable().WithDefaultValue(false)
            .WithColumn(nameof(Book.IsGift)).AsBoolean().NotNullable().WithDefaultValue(false)
            .WithColumn(nameof(Book.PageCount)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.InventoryManagementMethodId)).AsInt32().NotNullable()
            .WithColumn(nameof(Book.StockQuantity)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.LowStockThreshold)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.MarkAsBestseller)).AsBoolean().NotNullable().WithDefaultValue(false)
            .WithColumn(nameof(Book.MarkAsNew)).AsBoolean().NotNullable().WithDefaultValue(false)
            .WithColumn(nameof(Book.IsShowAsNewOnHome)).AsBoolean().NotNullable().WithDefaultValue(false)
            .WithColumn(nameof(Book.IsShowAsBestsellerOnHome)).AsBoolean().NotNullable().WithDefaultValue(false)
            .WithColumn(nameof(Book.DisplayOrderBestseller)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.DisplayOrderAsNew)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.DisplayOrderAsSale)).AsInt32().NotNullable().WithDefaultValue(0);

        Create.Table(nameof(ImportBook))
           .WithColumn(nameof(ImportBook.Id)).AsInt32().PrimaryKey().Identity()
           .WithColumn(nameof(ImportBook.BookId)).AsInt32().NotNullable()
           .WithColumn(nameof(ImportBook.InitialStockQuantity)).AsInt32().NotNullable().WithDefaultValue(0)
           .WithColumn(nameof(ImportBook.CostPrice)).AsDecimal(18, 2).NotNullable().WithDefaultValue(0)
           .WithColumn(nameof(ImportBook.StockQuantity)).AsInt32().NotNullable().WithDefaultValue(0)
            .WithColumn(nameof(Book.CreatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Book.UpdatedAt)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
           ;

        Create.ForeignKey($"FK_{nameof(ImportBook)}_{nameof(ImportBook.BookId)}")
            .FromTable(nameof(ImportBook)).ForeignColumn(nameof(ImportBook.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));

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
            .ToTable(nameof(Author)).PrimaryColumn(nameof(Author.Id)).OnDelete(System.Data.Rule.Cascade);

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

        // Create BookPublishers table
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
        Delete.Table("Book");
    }
}
