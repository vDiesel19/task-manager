using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Routes;

namespace Server.Services;

public class TaskService(AppDbContext db) : ITaskService
{
  public async Task<List<TaskResponse>> GetByUserIdAsync(int userId)
  {
    return await db.Tasks
      .Where(t => t.UserId == userId)
      .OrderByDescending(t => t.CreatedAt)
      .Select(t => new TaskResponse(
        t.Id,
        t.Title,
        t.Description,
        t.Status,
        t.CreatedAt,
        t.UserId,
        t.User.Name))
      .ToListAsync();
  }

  public async Task<ServiceResult<TaskResponse>> CreateAsync(CreateTaskRequest request)
  {
    if (!await db.Users.AnyAsync(u => u.Id == request.UserId))
      return ServiceResult<TaskResponse>.Fail(ServiceErrorKind.BadRequest, "User not found.");

    var task = new TaskItem
    {
      Title = request.Title,
      Description = request.Description,
      Status = request.Status,
      UserId = request.UserId,
    };

    db.Tasks.Add(task);
    await db.SaveChangesAsync();

    return ServiceResult<TaskResponse>.Ok(await ToResponseAsync(task));
  }

  public async Task<ServiceResult<TaskResponse>> UpdateAsync(int id, UpdateTaskRequest request)
  {
    var task = await db.Tasks.FindAsync(id);
    if (task is null)
      return ServiceResult<TaskResponse>.Fail(ServiceErrorKind.NotFound, "Task not found.");

    if (request.Title is not null)
      task.Title = request.Title;
    if (request.Description is not null)
      task.Description = request.Description;
    if (request.Status is TaskItemStatus status)
      task.Status = status;

    await db.SaveChangesAsync();

    return ServiceResult<TaskResponse>.Ok(await ToResponseAsync(task));
  }

  public async Task<bool> DeleteAsync(int id)
  {
    var task = await db.Tasks.FindAsync(id);
    if (task is null)
      return false;

    db.Tasks.Remove(task);
    await db.SaveChangesAsync();

    return true;
  }

  private async Task<TaskResponse> ToResponseAsync(TaskItem task)
  {
    var createdByName = await db.Users
      .Where(u => u.Id == task.UserId)
      .Select(u => u.Name)
      .FirstAsync();

    return new TaskResponse(
      task.Id,
      task.Title,
      task.Description,
      task.Status,
      task.CreatedAt,
      task.UserId,
      createdByName);
  }
}
