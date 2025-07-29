using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Products;
using Bogus;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202511)]
public class CreateDiscountTable : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Discount))
           .WithColumn(nameof(Discount.Id)).AsInt32().PrimaryKey().Identity()
           .WithColumn(nameof(Discount.Code)).AsString().NotNullable()
           .WithColumn(nameof(Discount.Description)).AsString().NotNullable()
           .WithColumn(nameof(Discount.DiscountPercentage)).AsInt32().Nullable()
           .WithColumn(nameof(Discount.MaxDiscountAmount)).AsDecimal().Nullable()
           .WithColumn(nameof(Discount.DiscountAmount)).AsDecimal().NotNullable().WithDefaultValue(0)
           .WithColumn(nameof(Discount.IsPercentage)).AsBoolean().NotNullable().WithDefaultValue(false)
           .WithColumn(nameof(Discount.IsPublic)).AsBoolean().NotNullable().WithDefaultValue(true)
           .WithColumn(nameof(Discount.IsDeleted)).AsBoolean().NotNullable().WithDefaultValue(false)
           .WithColumn(nameof(Discount.StartDate)).AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentDateTime)
           .WithColumn(nameof(Discount.EndDate)).AsDateTime().NotNullable().WithDefaultValue(DateTime.UtcNow.AddDays(30))
           .WithColumn(nameof(Discount.IsActive)).AsBoolean().NotNullable().WithDefaultValue(true)
           .WithColumn(nameof(Discount.MinimumOrderAmount)).AsDecimal().NotNullable().WithDefaultValue(0)
           .WithColumn(nameof(Discount.MaxUsagePerUser)).AsInt32().NotNullable().WithDefaultValue(1)
           .WithColumn(nameof(Discount.TotalUsageLimit)).AsInt32().Nullable()
           .WithColumn(nameof(Discount.CurrentUsageCount)).AsInt32().NotNullable().WithDefaultValue(0)
             .WithColumn(nameof(Discount.CreatedAt)).AsDateTime().NotNullable()
             .WithColumn(nameof(Discount.UpdatedAt)).AsDateTime().NotNullable();

        Create.Table(nameof(ApplicableDiscountBook))
            .WithColumn(nameof(ApplicableDiscountBook.DiscountId)).AsInt32().NotNullable()
            .WithColumn(nameof(ApplicableDiscountBook.BookId)).AsInt32().NotNullable();

        Create.Table(nameof(DiscountRole))
            .WithColumn(nameof(DiscountRole.DiscountId)).AsInt32().NotNullable()
            .WithColumn(nameof(DiscountRole.RoleId)).AsInt32().NotNullable();

        Create.Table(nameof(ExcludedDiscountBook))
            .WithColumn(nameof(ExcludedDiscountBook.DiscountId)).AsInt32().NotNullable()
            .WithColumn(nameof(ExcludedDiscountBook.BookId)).AsInt32().NotNullable();

        Create.ForeignKey("FK_ApplicableDiscountBook_Discount")
            .FromTable(nameof(ApplicableDiscountBook)).ForeignColumn(nameof(ApplicableDiscountBook.DiscountId))
            .ToTable(nameof(Discount)).PrimaryColumn(nameof(Discount.Id)).OnDelete(System.Data.Rule.Cascade);
        Create.ForeignKey("FK_ApplicableDiscountBook_Book")
            .FromTable(nameof(ApplicableDiscountBook)).ForeignColumn(nameof(ApplicableDiscountBook.BookId))
            .ToTable(nameof(Book)).PrimaryColumn(nameof(Book.Id));

        Create.PrimaryKey("PK_ApplicableDiscountBook").OnTable(nameof(ApplicableDiscountBook)).Columns(nameof(ApplicableDiscountBook.DiscountId), nameof(ApplicableDiscountBook.BookId));
        Create.PrimaryKey("PK_DiscountRole").OnTable(nameof(DiscountRole)).Columns(nameof(DiscountRole.DiscountId), nameof(DiscountRole.RoleId));
        Create.PrimaryKey("PK_ExcludedDiscountBook").OnTable(nameof(ExcludedDiscountBook)).Columns(nameof(ExcludedDiscountBook.DiscountId), nameof(ExcludedDiscountBook.BookId));
    }
    public override void Down()
    {
    }
}
