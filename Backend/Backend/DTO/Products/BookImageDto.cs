using LinqToDB.Mapping;

namespace Backend.DTO.Products;

public class BookImageDto
{


    public int Id { get; set; }
    public int BookId { get; set; }

    public string ImageUrl { get; set; } = null!;


    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
