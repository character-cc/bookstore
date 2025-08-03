namespace Backend.Services.ScheduleTasks;

public interface ITaskStartup
{
    Task InitializeAsync();

    Task Start();
}
