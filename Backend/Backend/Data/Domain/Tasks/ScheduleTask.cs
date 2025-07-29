namespace Backend.Data.Domain.Tasks;

public class ScheduleTask : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Second { get; set; } = 0;
    public bool IsEnabled { get; set; } = true;
    public DateTime? LastRunTime { get; set; }
    public DateTime? NextRunTime { get; set; }
    public string TaskType { get; set; } = string.Empty;
    public string Parameters { get; set; } = string.Empty;
}
