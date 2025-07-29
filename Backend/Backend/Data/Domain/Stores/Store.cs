using LinqToDB.Mapping;
using Microsoft.EntityFrameworkCore.Storage;

namespace Backend.Data.Domain.Stores;

[Table]
public class Store : BaseEntity
{
    [Column, NotNull]
    public string Name { get; set; } = string.Empty;

    [Column]
    public string Description { get; set; }

    [Column, NotNull]
    public string FullAddress { get; set; }

    [Column]
    public int ProvinceId { get; set; }

    [Column]
    public int DistrictId { get; set; }

    [Column]
    public int WardId { get; set; }

    [Column]
    public string StreetAddress { get; set; }

    [Column]
    public string PhoneNumber { get; set; }

    [Column]
    public string Email { get; set; }

    [Column]
    public string ManagerName { get; set; } = string.Empty;

    [Column]
    public bool IsActive { get; set; } = true;

    [Association(ThisKey = nameof(Id), OtherKey = nameof(StoreBook.StoreId))]
    public ICollection<StoreBook> Books { get; set; } = new List<StoreBook>();
}
