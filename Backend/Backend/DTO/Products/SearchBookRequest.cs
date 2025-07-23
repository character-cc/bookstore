using FluentValidation;

namespace Backend.DTO.Products;

public class SearchBookRequest
{
    public string Keyword { get; set; }
    public string Name { get; set; }

    public string Isbn { get; set; }

    public string SortBy { get; set; }
    public bool? SortDesc { get; set; }
    public int PageIndex { get; set; } = 0;
    public int PageSize { get; set; } = 10;

}
