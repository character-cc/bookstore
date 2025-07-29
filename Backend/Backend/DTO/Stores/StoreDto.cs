namespace Backend.DTO.Stores;

public class StoreDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; }

    public string FullAddress { get; set; }

    public int ProvinceId { get; set; }

    public int DistrictId { get; set; }

    public int WardId { get; set; }

    public string StreetAddress { get; set; }

    public string PhoneNumber { get; set; }

    public string Email { get; set; }

    public string ManagerName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } 

    public DateTime UpdatedAt { get; set; } 
}
