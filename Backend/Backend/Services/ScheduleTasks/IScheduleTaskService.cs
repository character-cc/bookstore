using Backend.Data.Domain.Tasks;

namespace Backend.Services.ScheduleTasks;

public interface IScheduleTaskService
{
    Task<IList<ScheduleTask>> GetAllTaskAsync();
}
