namespace Backend.DTO.Orders;

public class ZalopayCallbackRequest
{

    public string Data { get; set; }

    public string Mac { get; set; }

    public int Type { get; set; }
}
