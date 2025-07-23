using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Tracing;

namespace Backend.Data.Domain.Products.Enum;

public enum InventoryManagementMethodType
{
    [Display(Name = "Không theo dõi" , Description = "Khách hàng có thể mua không giới hạn số lượng")]
    None = 0,

    [Display(Name = "Theo dõi đơn giản", Description = "Nhập số lượng tồn kho chung cho sản phẩm")]
    SimpleTracking = 1,

    [Display(Name = "Theo dõi theo thuộc tính", Description = "Quản lý tồn kho riêng cho từng tổ hợp thuộc tính")]
    AttributeTracking = 2,

    [Display(Name = "Theo dõi theo cửa hàng", Description = "Quản lý tồn kho riêng cho từng cửa hàng")]
    StoreTracking = 3
}
