using System.Text;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Services.Products;

namespace Backend.Services.Email;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly IWebHostEnvironment _env;

    private readonly IBookService _bookService;


    public EmailTemplateService(IWebHostEnvironment env, IBookService bookService)
    {
        _env = env ?? throw new ArgumentNullException(nameof(env), "Web host environment is not initialized.");
        _bookService = bookService ?? throw new ArgumentNullException(nameof(bookService), "Book service is not initialized.");
    }

    public async Task<string> RenderDiscountEmailAsync(Discount discount)
    {
        var path = Path.Combine(_env.ContentRootPath, "Templates/DiscountEmail.cshtml");
        var template = await File.ReadAllTextAsync(path);

        var discountText = discount.IsPercentage
      ? $"Giảm {discount.DiscountPercentage}%{(discount.MaxDiscountAmount.HasValue ? $" (tối đa {discount.MaxDiscountAmount.Value:N0}₫)" : "")}"
      : $"Giảm trực tiếp {discount.DiscountAmount:N0}₫";

        return template
            .Replace("{{Code}}", discount.Code)
            .Replace("{{DiscountText}}", discountText)
            .Replace("{{MinimumOrderAmount}}", discount.MinimumOrderAmount.ToString("N0"))
            .Replace("{{StartDate}}", discount.StartDate.ToString("dd/MM/yyyy"))
            .Replace("{{EndDate}}", discount.EndDate.ToString("dd/MM/yyyy"))
            .Replace("{{MaxUsagePerUser}}", discount.MaxUsagePerUser.ToString())
            .Replace("{{ShopUrl}}", "http://localhost.com");
    }
    public async Task<string> RenderNewOrderNotificationEmailAsync(Order order)
    {
        var templatePath = Path.Combine(_env.ContentRootPath, "Templates/NewOrderNotification.cshtml");

        if (!File.Exists(templatePath))
            throw new FileNotFoundException("Không tìm thấy template email", templatePath);

        var template = await File.ReadAllTextAsync(templatePath);

        var orderItemsHtml = string.Join("", order.Items.Select(item => $@"
          <tr>
            <td>{item.BookName}</td>
            <td>{item.Quantity}</td>
            <td>{item.UnitPrice:N0}₫</td>
            <td>{(item.Quantity * item.UnitPrice):N0}₫</td>
        </tr>"));

        var html = template
            .Replace("{{TransactionId}}", order.TransactionId)
            .Replace("{{CustomerName}}", order.CustomerName)
            .Replace("{{CustomerPhone}}", order.CustomerPhone)
            .Replace("{{ShippingAddress}}", order.ShippingAddress)
            .Replace("{{CreatedAt}}", DateTime.Now.ToString("dd/MM/yyyy HH:mm"))
            .Replace("{{ShippingFee}}", order.ShippingFee.ToString("N0"))
            .Replace("{{DiscountAmount}}", order.DiscountAmount.ToString("N0"))
            .Replace("{{TotalAmount}}", order.TotalAmount.ToString("N0"))
            .Replace("{{OrderItems}}", orderItemsHtml)
            .Replace("{{AdminOrderUrl}}", $"http://localhost/admin/orders/{order.Id}");

        return html;
    }

    public async Task<string> RenderLowStockEmailAsync(List<Book> lowStockBooks)
    {
        var path = Path.Combine(_env.ContentRootPath, "Templates/LowStockEmail.cshtml");
        var template = await File.ReadAllTextAsync(path);

        var sb = new StringBuilder();
        int index = 1;
        foreach (var book in lowStockBooks)
        {
            sb.AppendLine($@"
            <tr>
                <td>{index++}</td>
                <td>{book.Name}</td>
                <td>{book.Isbn}</td>
                <td>{await _bookService.GetStockQuantityAsync(book.Id)}</td>
                <td>{book.LowStockThreshold}</td>
            </tr>");
        }

        return template.Replace("{LowStockRows}", sb.ToString());
    }

    public async Task<string> RenderOtpEmailAsync(string otpCode, string shopName = "Trí Tuệ")
    {
        var path = Path.Combine(_env.ContentRootPath, "Templates/OtpEmail.cshtml");
        var template = await File.ReadAllTextAsync(path);

        return template
            .Replace("{{OtpCode}}", otpCode)
            .Replace("{{ShopName}}", shopName);
    }

}
