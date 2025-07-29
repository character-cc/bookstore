namespace Backend.Services.ScheduleTasks;

public interface ITaskStartup
{
    Task InitializeAsync();


    Task StartAsync();

    Task StopAsync();
}
