using AutoMapper;
using Backend.Common;
using Backend.DTO.Orders;
using Backend.Services.Orders;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Area.Admin.Controller;

[Route("admin")]
public class OrderController : AdminController
{
    private readonly IOrderService _orderService;

    private readonly IMapper _mapper;

    public OrderController(IOrderService orderService, IMapper mapper)
    {
        _orderService = orderService ?? throw new ArgumentNullException(nameof(orderService), "Order service is not initialized.");
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper), "Mapper is not initialized.");
    }

    [HttpPost("orders/search")]
    public async Task<IActionResult> SearchOrders([FromBody] GetOrderRequest request)
    {
        if (request == null)
            return BadRequest("Invalid search request.");

        var orders = await _orderService.GetOrdersAsync(
            request.Keyword, request.PageIndex, request.PageSize,
            request.FromDate, request.ToDate, request.Status
        );

        var orderDtos = _mapper.Map<List<OrderDto>>(orders.Items);

        var result = new PagedList<OrderDto>(
            orderDtos,  orders.PageIndex, orders.PageSize,orders.TotalCount
        );

        return Ok(result);
    }

    [HttpGet("orders/status")]
    public async Task<ActionResult<OrderStatusDto>> GetOrderStats()
    {
            var stats = await _orderService.GetOrderStatsAsync();
            return Ok(stats);
      
    }

    [HttpGet("orders/revenue/month")]
    public async Task<ActionResult<List<RevenueDataDto>>> GetMonthlyRevenue()
    {
        try
        {
            var revenueData = await _orderService.GetMonthlyRevenueDataAsync();
            return Ok(revenueData);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error loading monthly revenue data: {ex.Message}");
        }
    }

    [HttpGet("orders/revenue/year")]
    public async Task<ActionResult<List<RevenueDataDto>>> GetYearlyRevenue()
    {
        try
        {
            var revenueData = await _orderService.GetYearlyRevenueDataAsync();
            return Ok(revenueData);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error loading yearly revenue data: {ex.Message}");
        }
    }

    [HttpGet("profit/summary")]
    public async Task<ActionResult<ProfitSummaryDto>> GetProfitSummary([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var summary = await _orderService.GetProfitSummaryAsync(startDate, endDate);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error loading profit summary: {ex.Message}");
        }
    }

    [HttpPost("orders/profit")]
    public async Task<ActionResult<List<OrderDto>>> GetOrdersProfit([FromBody] ProfitRequest request)
    {
  
            var orders = await _orderService.GetOrdersProfitAsync(request.StartDate, request.EndDate, request.PageIndex, request.PageSize, request.SearchTerm );
            var orderDtos = orders.Items.Select(o => _mapper.Map<OrderDto>(o)).ToList();
            var result = new PagedList<OrderDto>(
                orderDtos, orders.PageIndex, orders.PageSize, orders.TotalCount
            );
            return Ok(orders);
        
      
    }

}
