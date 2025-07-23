
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Users;

[Table]
public class EmailOtp : BaseEntity, IEntity
{

    [Column, NotNull]
    public string Email { get; set; } = string.Empty;

    [Column, NotNull]
    public string OtpCode { get; set; } = string.Empty;

    [Column, NotNull]
    public DateTime ExpriedAt { get; set; }

}
