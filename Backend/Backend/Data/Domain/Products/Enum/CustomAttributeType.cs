using System.ComponentModel.DataAnnotations;

namespace Backend.Data.Domain.Products.Enum;

public enum CustomAttributeType
{
    [Display(Name = "Danh sách thả xuống", Description = "Cho phép người dùng chọn một giá trị từ danh sách")]
    DropDown = 0,

    [Display(Name = "Danh sách radio", Description = "Cho phép người dùng chọn một giá trị từ danh sách radio")]
    Radio = 1,

    [Display(Name = "Danh sách checkbox", Description = "Cho phép người dùng chọn nhiều giá trị từ danh sách")]
    CheckBox = 2,

    [Display(Name = "Hộp văn bản", Description = "Cho phép người dùng nhập giá trị tự do")]
    TextBox = 3,
}
