using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;

namespace Server.Routes;

public static class UserRoutes
{
    public static void MapUserRoutes(this WebApplication app)
    {
        var group = app.MapGroup("/users").WithTags("Users");

        group.MapGet("/", async (AppDbContext db) =>
            await db.Users
                .OrderBy(u => u.Name)
                .Select(u => new UserResponse(u.Id, u.Name, u.Email))
                .ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var user = await db.Users
                .Where(u => u.Id == id)
                .Select(u => new UserResponse(u.Id, u.Name, u.Email))
                .FirstOrDefaultAsync();

            return user is null ? Results.NotFound() : Results.Ok(user);
        });

        group.MapPost("/", async (CreateUserRequest request, AppDbContext db) =>
        {
            if (await db.Users.AnyAsync(u => u.Email == request.Email))
                return Results.Conflict(new { error = "A user with that email already exists." });

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var response = new UserResponse(user.Id, user.Name, user.Email);
            return Results.Created($"/users/{user.Id}", response);
        });

        group.MapPut("/{id:int}", async (int id, UpdateUserRequest request, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null)
                return Results.NotFound();

            if (request.Email is not null && request.Email != user.Email
                && await db.Users.AnyAsync(u => u.Email == request.Email))
                return Results.Conflict(new { error = "A user with that email already exists." });

            if (request.Name is not null)
                user.Name = request.Name;
            if (request.Email is not null)
                user.Email = request.Email;

            await db.SaveChangesAsync();

            return Results.Ok(new UserResponse(user.Id, user.Name, user.Email));
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null)
                return Results.NotFound();

            db.Users.Remove(user);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

public record UserResponse(int Id, string Name, string Email);

public record CreateUserRequest(string Name, string Email);

public record UpdateUserRequest(string? Name = null, string? Email = null);
