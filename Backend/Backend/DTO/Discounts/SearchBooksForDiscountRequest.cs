namespace Backend.DTO.Discounts;

public class SearchBooksForDiscountRequest
{
    public string Keyword { get; set; } = string.Empty;
    public int? DiscountId { get; set; }
    public bool IsSelectingForApplicable { get; set; } = true;
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 100;
}
