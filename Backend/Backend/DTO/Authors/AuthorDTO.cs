namespace Backend.DTO.Authors;

public class AuthorDTO
{
    public int Id { get; set; } 
    public string Name { get; set; }

    public string Biography { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsShownOnHomePage { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;

    public DateTime CreateAt { get; set; } 

    public DateTime UpdatedAt { get; set; } 



}
