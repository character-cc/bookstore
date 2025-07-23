using Backend.Common;
using Backend.Data.Domain.Orders;
using Backend.DTO.Orders;
using Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure;

namespace Backend.Services.Orders;

public interface IOrderService
{
    Task<ProfitSummaryDto> GetProfitSummaryAsync(DateTime startDate, DateTime endDate);
    Task<IPagedList<Order>> GetOrdersProfitAsync(DateTime startDate, DateTime endDate,
        int pageIndex = 0 , int pageSize = 10, string searchTerm = "");
    Task InsertOrderAsync(Order order);

    Task UpdateInventoryBasedOnOrderStatusChangeAsync(Order order, string previousStatus);
    Task InsertOrderItemsAsync(List<OrderItem> orderItems);

    Task DeleteOrderNotCompletedAsync(int userId);

    Task<Order> GetOrderByTransactionIdAsync(string transactionId);

    Task UpdateOrderItemsAsync(List<OrderItem> orderItems);

    Task UpdateOrderAsync(Order order);

    Task<IPagedList<Order>> GetOrdersAsync(
        string keyword, int pageIndex, int pageSize,
        DateTime? fromDate, DateTime? toDate, string status = "");

    Task<Order> GetOrderByIdAsync(int orderId);

    Task UpdateShippingTrackingsAsync(int orderId,List<ShippingTracking> shippingTrackings);

    Task<List<Order>> GetOrdersByUserIdAsync(int userId, string status = "");

    Task<OrderStatusDto> GetOrderStatsAsync();

    Task<List<RevenueDataDto>> GetMonthlyRevenueDataAsync();
    Task<List<RevenueDataDto>> GetYearlyRevenueDataAsync();
}
