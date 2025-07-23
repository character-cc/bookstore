using System.Text.Json;
using LinqToDB;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Products;

[Table]
public class AttributeCombination : BaseEntity, IEntity
{


    [Column , NotNull]
    public int BookId { get; set; }

    [Column, NotNull]
    public string AttributesJson { get; set; }


    [NotColumn]
    public Dictionary<string, string> Attributes
    {
        get => string.IsNullOrEmpty(AttributesJson)
            ? new Dictionary<string, string>()
            : JsonSerializer.Deserialize<Dictionary<string, string>>(AttributesJson);

        set => AttributesJson = JsonSerializer.Serialize(value);
    }

    [Column]
    public string Sku { get; set; } = string.Empty;

    [Column]
    public decimal Price { get; set; } = 0;

    [Column]
    public int LowStockThreshold { get; set; } = 0;

    [Column]
    public int StockQuantity { get; set; } = 0;

    [Column]
    public bool IsActive { get; set; } = true;


}

  
