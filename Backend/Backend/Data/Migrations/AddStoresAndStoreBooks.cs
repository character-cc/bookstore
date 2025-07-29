using Backend.Data.Domain.Stores;
using FluentMigrator;

namespace Backend.Data.Migrations;

[Migration(202519)]
public class AddStoresAndStoreBooks : Migration
{
    public override void Up()
    {
        Create.Table(nameof(Store))
            .WithColumn(nameof(Store.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(Store.Name)).AsString(255).NotNullable()
            .WithColumn(nameof(Store.Description)).AsString(int.MaxValue).Nullable()
            .WithColumn(nameof(Store.FullAddress)).AsString(500).NotNullable()
            .WithColumn(nameof(Store.ProvinceId)).AsInt32().NotNullable()
            .WithColumn(nameof(Store.DistrictId)).AsInt32().NotNullable()
            .WithColumn(nameof(Store.WardId)).AsInt32().NotNullable()
            .WithColumn(nameof(Store.StreetAddress)).AsString(500).Nullable()
            .WithColumn(nameof(Store.PhoneNumber)).AsString(50).NotNullable()
            .WithColumn(nameof(Store.Email)).AsString(255).NotNullable()
            .WithColumn(nameof(Store.ManagerName)).AsString(255).NotNullable()
            .WithColumn(nameof(Store.IsActive)).AsBoolean().WithDefaultValue(true)
            .WithColumn(nameof(Store.CreatedAt)).AsDateTime().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(Store.UpdatedAt)).AsDateTime().WithDefault(SystemMethods.CurrentUTCDateTime);

        Create.Table(nameof(StoreBook))
            .WithColumn(nameof(StoreBook.Id)).AsInt32().PrimaryKey().Identity()
            .WithColumn(nameof(StoreBook.StoreId)).AsInt32().NotNullable()
            .WithColumn(nameof(StoreBook.BookId)).AsInt32().NotNullable()
            .WithColumn(nameof(StoreBook.Quantity)).AsInt32().WithDefaultValue(0).NotNullable()
            .WithColumn(nameof(StoreBook.LowStockThreshold)).AsInt32().WithDefaultValue(0).NotNullable()
            .WithColumn(nameof(StoreBook.CreatedAt)).AsDateTime().WithDefault(SystemMethods.CurrentUTCDateTime)
            .WithColumn(nameof(StoreBook.UpdatedAt)).AsDateTime().WithDefault(SystemMethods.CurrentUTCDateTime);

        Create.ForeignKey($"FK_{nameof(StoreBook)}_{nameof(Store)}")
            .FromTable(nameof(StoreBook)).ForeignColumn(nameof(StoreBook.StoreId))
            .ToTable(nameof(Store)).PrimaryColumn(nameof(Store.Id));
    }

    public override void Down()
    {
       
    }
}