namespace Backend.Services.ScheduleTasks;

public class TaskStartup : ITaskStartup
{

    private readonly IScheduleTaskService _scheduleTaskService;

    public TaskStartup(IScheduleTaskService scheduleTaskService)
    {
        _scheduleTaskService = scheduleTaskService;
    }

    public async Task InitializeAsync()
    {
        var tasks = await _scheduleTaskService.GetAllTaskAsync();
        foreach (var task in tasks)
        {
            
        }
    }
    public async Task StartAsync()
    {
        return;
    }
    public async Task StopAsync()
    {
        return;
    }
}
