using Backend.Data.Domain.Tasks;

namespace Backend.Services.ScheduleTasks;

public class TaskStartup : ITaskStartup
{


    private readonly List<TaskThread> _threads = new();

    private readonly IServiceScopeFactory _serviceScopeFactory;

    public TaskStartup(IServiceScopeFactory serviceScopeFactory , 
        IHttpClientFactory httpClientFactory
        )
    {
        _serviceScopeFactory = serviceScopeFactory ?? throw new ArgumentNullException(nameof(serviceScopeFactory));
        TaskThread.ServiceScopeFactory = serviceScopeFactory;
        TaskThread.HttpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
    }
    public async Task InitializeAsync()
    {
        using var scope = _serviceScopeFactory.CreateScope();
        //var scheduleTaskService = scope.ServiceProvider.GetRequiredService<IScheduleTaskService>();
        //var tasks = await scheduleTaskService.GetAllTaskAsync();
        var tasks = new List<ScheduleTask>
        {
            new ScheduleTask { Name = "Task1", Second = 10 },
            new ScheduleTask { Name = "Task2", Second = 20 },
            new ScheduleTask { Name = "Task3", Second = 30 }
        };
        foreach (var task in tasks)
        {
            _threads.Add(new TaskThread(task));
        }
    }
   
    public Task Start()
    {
        Task.WhenAll(_threads.Select(t => t.Start()));
        return Task.CompletedTask;
    }

    class TaskThread
    {
        private readonly ScheduleTask _scheduleTask;

        public static IServiceScopeFactory ServiceScopeFactory { get; set; }

        public static IHttpClientFactory HttpClientFactory { get; set; }

        public TaskThread(ScheduleTask scheduleTask)
        {
            _scheduleTask = scheduleTask ?? throw new ArgumentNullException(nameof(scheduleTask));
        }

        public async Task Start(CancellationToken cancellationToken = default)
        {
            int second = _scheduleTask.Second;
            if (second <= 0)
            {
                return;
            }

            using var client = HttpClientFactory.CreateClient();
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var data = new Dictionary<string, string> {  
                        { "taskName", _scheduleTask.Name }, 
                    };
                    var response = await client.PostAsync(
                        $"https://localhost:7029/api/scheduletask",
                        new FormUrlEncodedContent(data),
                        cancellationToken);

                    if (!response.IsSuccessStatusCode)
                    {
                        Console.WriteLine($"Task {_scheduleTask.Name} failed: {response.StatusCode}");
                    }
                }
                catch (OperationCanceledException)
                {
                    Console.WriteLine($"Task {_scheduleTask.Name} canceled.");
                    break;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error starting task {_scheduleTask.Name}: {ex.Message}");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(second), cancellationToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }
    }
}
