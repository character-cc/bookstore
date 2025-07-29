namespace Backend.DTO.Authors;

public class GetAuthorsRequest
{
    public string Keyword { get; set; } = string.Empty;
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = int.MaxValue;
}
