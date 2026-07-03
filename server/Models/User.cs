namespace Server.Models;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public ICollection<TaskItem> Tasks { get; set; } = [];
}
