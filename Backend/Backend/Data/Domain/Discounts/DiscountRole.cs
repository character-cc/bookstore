using Backend.Data.Domain.Users;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Discounts;

[Table]
public class DiscountRole : IEntity
{

    [Column, NotNull]
    public int DiscountId { get; set; }

    [Column, NotNull]
    public int RoleId { get; set; }

}
