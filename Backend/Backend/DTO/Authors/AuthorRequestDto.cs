namespace Backend.DTO.Authors;

public class AuthorRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Biography { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsShownOnHomePage { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
}
