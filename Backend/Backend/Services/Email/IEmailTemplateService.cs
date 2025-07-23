using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;

namespace Backend.Services.Email;

public interface IEmailTemplateService
{
    Task<string> RenderDiscountEmailAsync(Discount discount);

    Task<string> RenderNewOrderNotificationEmailAsync(Order order);

    Task<string> RenderLowStockEmailAsync(List<Book> lowStockBooks);

    Task<string> RenderOtpEmailAsync(string otpCode, string shopName = "BookStore");
}
