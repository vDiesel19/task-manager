using Server.Models;
using Server.Services;

namespace Server.Routes;

public record TaskResponse(
  int Id,
  string Title,
  string? Description,
  TaskItemStatus Status,
  DateTime CreatedAt,
  int UserId,
  string CreatedByName
);

public record CreateTaskRequest(
  string Title,
  int UserId,
  string? Description = null,
  TaskItemStatus Status = TaskItemStatus.NotStarted
);

public record UpdateTaskRequest(
  string? Title = null,
  string? Description = null,
  TaskItemStatus? Status = null
);

public static class TaskRoutes {
  public static void MapTaskRoutes(this WebApplication app) {
    var group = app.MapGroup("/tasks").WithTags("Tasks");

    group.MapGet("/", async (int userId, ITaskService tasks) =>
    {
      if (userId <= 0)
        return Results.BadRequest(new { error = "A valid userId is required." });

      return Results.Ok(await tasks.GetByUserIdAsync(userId));
    });

    group.MapPost("/", async (CreateTaskRequest request, ITaskService tasks) => {
      var result = await tasks.CreateAsync(request);
      if (!result.IsSuccess)
        return RouteResults.ToErrorResult(result.Error!);

      return Results.Created($"/tasks/{result.Value!.Id}", result.Value);
    });

    group.MapPut("/{id:int}", async (int id, UpdateTaskRequest request, ITaskService tasks) => {
      var result = await tasks.UpdateAsync(id, request);
      if (!result.IsSuccess)
        return RouteResults.ToErrorResult(result.Error!);

      return Results.Ok(result.Value);
    });

    group.MapDelete("/{id:int}", async (int id, ITaskService tasks) => {
      var deleted = await tasks.DeleteAsync(id);
      return deleted ? Results.NoContent() : Results.NotFound();
    });
  }
}
