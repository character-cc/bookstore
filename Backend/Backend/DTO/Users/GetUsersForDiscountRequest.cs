namespace Backend.DTO.Users;

public class GetUsersForDiscountRequest
{
    public string Keyword { get; set; } = string.Empty;

    public int PageIndex { get; set; } = 0;

    public int PageSize { get; set; } = 100;
}
