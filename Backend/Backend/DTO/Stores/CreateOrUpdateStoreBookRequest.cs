namespace Backend.DTO.Stores;

public class CreateOrUpdateStoreBookRequest
{
    public int StoreId { get; set; }
    public int BookId { get; set; }
    public int Quantity { get; set; }

    public int LowStockThreshold { get; set; } 

}
