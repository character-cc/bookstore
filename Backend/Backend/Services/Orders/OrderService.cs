using Backend.Common;
using Backend.Data;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.DTO.Orders;
using LinqToDB;

namespace Backend.Services.Orders;

public class OrderService : IOrderService
{
    private readonly IRepository<Order> _orderRepository;

    private readonly IRepository<OrderItem> _orderItemRepository;

    private readonly IRepository<ShippingTracking> _shippingTrackingRepository;

    private readonly IRepository<InventoryTransaction> _inventoryTransactionRepository;

    private readonly IRepository<ImportBook> _importBookRepository;


    public OrderService(
        IRepository<Order> orderRepository,
        IRepository<OrderItem> orderItemRepository,
        IRepository<ShippingTracking> shippingTrackingRepository,
        IRepository<InventoryTransaction> inventoryTransactionRepository,
        IRepository<ImportBook> importBookRepository)
    {
        _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _orderItemRepository = orderItemRepository ?? throw new ArgumentNullException(nameof(orderItemRepository));
        _shippingTrackingRepository = shippingTrackingRepository ?? throw new ArgumentNullException(nameof(shippingTrackingRepository));
        _inventoryTransactionRepository = inventoryTransactionRepository ?? throw new ArgumentNullException(nameof(inventoryTransactionRepository));
        _importBookRepository = importBookRepository ?? throw new ArgumentNullException(nameof(importBookRepository));
    }
    public async Task InsertOrderAsync(Order order)
    {
        if (order == null)
            throw new ArgumentNullException(nameof(order));
        await _orderRepository.InsertAsync(order);
    }

    public async Task InsertOrderItemsAsync(List<OrderItem> orderItems)
    {
        if (orderItems == null || !orderItems.Any())
            throw new ArgumentNullException(nameof(orderItems));
        await _orderItemRepository.InsertAsync(orderItems);
    }

    public async Task DeleteOrderNotCompletedAsync(int userId)
    {
        if (userId <= 0)
            throw new ArgumentException("Invalid user ID", nameof(userId));
        await _orderRepository.EntitySet

            .Where(o => o.UserId == userId && o.IsComplete == false)
            .DeleteAsync();
    }

    public async Task<Order> GetOrderByTransactionIdAsync(string transactionId)
    {
        if (string.IsNullOrEmpty(transactionId))
            throw new ArgumentException("Transaction ID cannot be null or empty.", nameof(transactionId));
        return await _orderRepository.EntitySet
                    .LoadWith(o => o.Items)
            .LoadWith(o => o.Tracking)
            .LoadWith(o => o.User)
            .Where(o => o.TransactionId == transactionId)
            .FirstOrDefaultAsync();
    }

    public async Task UpdateOrderAsync(Order order)
    {
        if (order == null)
            throw new ArgumentNullException(nameof(order));
        await _orderRepository.UpdateAsync(order);
    }


    public async Task<IPagedList<Order>> GetOrdersAsync(
     string keyword, int pageIndex, int pageSize,
     DateTime? fromDate, DateTime? toDate, string status = "")
    {
        var query = _orderRepository.EntitySet
            .Where(o => o.IsComplete); 

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(o => o.Id.ToString().Contains(keyword) ||
                 o.CustomerPhone.Contains(keyword) ||
                o.TransactionId.Contains(keyword) ||
                 (o.CustomerName).Contains(keyword)) ;

        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (fromDate.HasValue)
            query = query.Where(o => o.CreatedAt >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(o => o.CreatedAt <= toDate.Value);

        query = query
            .LoadWith(o => o.Items)
            .LoadWith(o => o.Tracking)
            .LoadWith(o => o.User);

        query = query.OrderByDescending(o => o.UpdatedAt);

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }

    public async Task<Order> GetOrderByIdAsync(int orderId)
    {
        return await _orderRepository.EntitySet
            .Where(o => o.Id == orderId)
            .LoadWith(o => o.Items)
            .LoadWith(o => o.Tracking)
            .LoadWith(o => o.User)
            .FirstOrDefaultAsync();
    }


    public async Task UpdateShippingTrackingsAsync(int orderId, List<ShippingTracking> shippingTrackings)
    {
        if (shippingTrackings == null || !shippingTrackings.Any())
            return ;
        await _shippingTrackingRepository.EntitySet.Where(t => t.OrderId == orderId)
            .DeleteAsync();
        foreach (var tracking in shippingTrackings)
        {
            await _shippingTrackingRepository.InsertAsync(tracking);
        }
    }

    public async Task<List<Order>> GetOrdersByUserIdAsync(int userId, string status = "")
    {
        if (userId <= 0)
            throw new ArgumentException("Invalid user ID", nameof(userId));
        var query = _orderRepository.EntitySet
            .Where(o => o.UserId == userId && o.IsComplete);
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }
        return await query
            .LoadWith(o => o.Items)
            .LoadWith(o => o.Tracking)
            .LoadWith(o => o.User)
            .OrderByDescending(o => o.UpdatedAt)
        .ToListAsync();
    }

    public async Task<OrderStatusDto> GetOrderStatsAsync()
    {
        var query = _orderRepository.EntitySet
            .Where(o => o.IsComplete); 

        var stats = await query
            .GroupBy(o => o.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
        .ToListAsync();

        var result = new OrderStatusDto
        {
            Pending = stats.FirstOrDefault(s => s.Status == OrderStatus.Pending.ToString())?.Count ?? 0,
            Shipping = stats.FirstOrDefault(s => s.Status == OrderStatus.Shipping.ToString())?.Count ?? 0,
            Processing = stats.FirstOrDefault(s => s.Status == OrderStatus.Processing.ToString())?.Count ?? 0,
            Completed = stats.FirstOrDefault(s => s.Status == OrderStatus.Completed.ToString())?.Count ?? 0,
            Cancelled = stats.FirstOrDefault(s => s.Status == OrderStatus.Cancelled.ToString())?.Count ?? 0
        };

        return result;
    }

    public async Task UpdateOrderItemsAsync(List<OrderItem> orderItems)
    {
        if (orderItems == null || !orderItems.Any())
            throw new ArgumentNullException(nameof(orderItems));
      
        await _orderItemRepository.UpdateAsync(orderItems);
    }

    public async Task UpdateInventoryBasedOnOrderStatusChangeAsync(Order order, string previousStatus)
    {
        if (order == null)
            throw new ArgumentNullException(nameof(order));
        var inventoryTrasactions = await _inventoryTransactionRepository.EntitySet
            .Where(t => t.OrderId == order.Id)
            .ToListAsync();
        if (order.Status != OrderStatus.Cancelled.ToString() && previousStatus == OrderStatus.Cancelled.ToString())
        {
            foreach (var inventoryTransaction in inventoryTrasactions)
            {
                var importBook = await _importBookRepository.EntitySet
                    .Where(i => i.Id == inventoryTransaction.ImportBookId)
                    .FirstOrDefaultAsync();
                if (importBook != null)
                {
                    importBook.StockQuantity -= inventoryTransaction.Quantity;
                    await _importBookRepository.UpdateAsync(importBook);
                }
            }
        }
        else if (order.Status == OrderStatus.Cancelled.ToString() && previousStatus != OrderStatus.Cancelled.ToString())
        {
            foreach(var inventoryTransaction in inventoryTrasactions)
            {
                var importBook = await _importBookRepository.EntitySet
                    .Where(i => i.Id == inventoryTransaction.ImportBookId)
                    .FirstOrDefaultAsync();
                if (importBook != null)
                {
                    importBook.StockQuantity += inventoryTransaction.Quantity;
                    await _importBookRepository.UpdateAsync(importBook);
                }
            }
        }
    }
    public async Task<List<RevenueDataDto>> GetMonthlyRevenueDataAsync()
    {
        var query = _orderRepository.EntitySet
            .Where(o => o.IsComplete && o.Status == OrderStatus.Completed.ToString());

        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddMonths(-11);

        var monthlyRevenue = await query
            .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
            .GroupBy(o => new { Year = o.CreatedAt.Year, Month = o.CreatedAt.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        var result = new List<RevenueDataDto>();
        for (var date = startDate; date <= endDate; date = date.AddMonths(1))
        {
            var yearMonth = monthlyRevenue.FirstOrDefault(m => m.Year == date.Year && m.Month == date.Month);
            result.Add(new RevenueDataDto
            {
                Period = date.ToString("MM/yyyy"),
                Revenue = yearMonth?.Revenue ?? 0
            });
        }

        return result;
    }

    public async Task<ProfitSummaryDto> GetProfitSummaryAsync(DateTime startDate, DateTime endDate)
    {
        endDate = endDate.AddDays(1).AddTicks(-1); 
        var orders = await _orderRepository.EntitySet
            .Where(o => o.IsComplete && o.Status == OrderStatus.Completed.ToString()
                     && o.CreatedAt >= startDate && o.CreatedAt <= endDate).ToListAsync();
        var totalProfit = orders.Sum(o => o.Profit);
        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalBaseCost = orders.Sum(o => o.TotalBaseCost);
        var totalShippingFee = orders.Sum(o => o.ShippingFee);
        var orderCount = orders.Count;
        return new ProfitSummaryDto
        {
            TotalProfit = totalProfit,
            TotalRevenue = totalRevenue,
            TotalBaseCost = totalBaseCost,
            TotalShippingFee = totalShippingFee,
            OrderCount = orderCount
        };
    }

    public async Task<IPagedList<Order>> GetOrdersProfitAsync(DateTime startDate, DateTime endDate, int pageIndex, int pageSize, string searchTerm = "")
    {
        endDate = endDate.AddDays(1).AddTicks(-1);

        var query = _orderRepository.EntitySet;
        if (!string.IsNullOrWhiteSpace(searchTerm))
        { 
            query = query.Where(o => o.Id.ToString().Contains(searchTerm) ||  o.TransactionId.Contains(searchTerm) ||
                                     (o.CustomerPhone).Contains(searchTerm));
        }
        query = query
            .Where(o => o.IsComplete && o.Status == OrderStatus.Completed.ToString()
                     && o.CreatedAt >= startDate && o.CreatedAt <= endDate)
            .OrderByDescending(o => o.CreatedAt);
       
         return await query.ToPagedListAsync(pageIndex, pageSize);
    }
    public async Task<List<RevenueDataDto>> GetYearlyRevenueDataAsync()
    {
        var query = _orderRepository.EntitySet
            .Where(o => o.IsComplete && o.Status == OrderStatus.Completed.ToString());

        var endYear = DateTime.UtcNow.Year;
        var startYear = endYear - 4;

        var yearlyRevenue = await query
            .Where(o => o.CreatedAt.Year >= startYear && o.CreatedAt.Year <= endYear)
            .GroupBy(o => o.CreatedAt.Year)
            .Select(g => new
            {
                Year = g.Key,
                Revenue = g.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        var result = new List<RevenueDataDto>();
        for (var year = startYear; year <= endYear; year++)
        {
            var yearData = yearlyRevenue.FirstOrDefault(y => y.Year == year);
            result.Add(new RevenueDataDto
            {
                Period = year.ToString(),
                Revenue = yearData?.Revenue ?? 0
            });
        }

        return result;
    }
}
