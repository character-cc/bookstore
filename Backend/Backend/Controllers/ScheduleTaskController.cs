using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/scheduletask")]
public class ScheduleTaskController : Controller
{
    [HttpPost]
    public IActionResult ExecuteTask([FromForm] string taskName)
    {

        Console.WriteLine($"Thực thi task với tên: {taskName}");
        return Ok(new { Message = $"Task '{taskName}' executed successfully." });
    }
}
