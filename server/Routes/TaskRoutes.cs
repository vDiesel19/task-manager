using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Routes;

public static class TaskRoutes
{
    public static void MapTaskRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/tasks").WithTags("Tasks");

        group.MapGet("/", async (AppDbContext db) =>
            await db.Tasks
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TaskResponse(
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.CreatedAt,
                    t.UserId))
                .ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var task = await db.Tasks
                .Where(t => t.Id == id)
                .Select(t => new TaskResponse(
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.CreatedAt,
                    t.UserId))
                .FirstOrDefaultAsync();

            return task is null ? Results.NotFound() : Results.Ok(task);
        });

        group.MapPost("/", async (CreateTaskRequest request, AppDbContext db) =>
        {
            if (!await db.Users.AnyAsync(u => u.Id == request.UserId))
                return Results.BadRequest(new { error = "User not found." });

            var task = new TaskItem
            {
                Title = request.Title,
                Description = request.Description,
                Status = request.Status,
                UserId = request.UserId,
            };

            db.Tasks.Add(task);
            await db.SaveChangesAsync();

            var response = new TaskResponse(
                task.Id,
                task.Title,
                task.Description,
                task.Status,
                task.CreatedAt,
                task.UserId);

            return Results.Created($"/tasks/{task.Id}", response);
        });

        group.MapPut("/{id:int}", async (int id, UpdateTaskRequest request, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null)
                return Results.NotFound();

            if (request.UserId is int userId && !await db.Users.AnyAsync(u => u.Id == userId))
                return Results.BadRequest(new { error = "User not found." });

            if (request.Title is not null)
                task.Title = request.Title;
            if (request.Description is not null)
                task.Description = request.Description;
            if (request.Status is TaskItemStatus status)
                task.Status = status;
            if (request.UserId is int newUserId)
                task.UserId = newUserId;

            await db.SaveChangesAsync();

            return Results.Ok(new TaskResponse(
                task.Id,
                task.Title,
                task.Description,
                task.Status,
                task.CreatedAt,
                task.UserId));
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null)
                return Results.NotFound();

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    TaskItemStatus Status,
    DateTime CreatedAt,
    int UserId);

public record CreateTaskRequest(
    string Title,
    int UserId,
    string? Description = null,
    TaskItemStatus Status = TaskItemStatus.NotStarted);

public record UpdateTaskRequest(
    string? Title = null,
    string? Description = null,
    TaskItemStatus? Status = null,
    int? UserId = null);
