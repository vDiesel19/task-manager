using Server.Services;

namespace Server.Routes;

public record UserResponse(int Id, string Name);

public record CreateUserRequest(string Name);

public static class UserRoutes
{
  public static void MapUserRoutes(this WebApplication app)
  {
    var group = app.MapGroup("/users").WithTags("Users");

    group.MapGet("/", (IUserService users) => users.GetAllAsync());

    group.MapGet("/{id:int}", async (int id, IUserService users) =>
    {
      var user = await users.GetByIdAsync(id);
      return user is null ? Results.NotFound() : Results.Ok(user);
    });

    group.MapPost("/", async (CreateUserRequest request, IUserService users) =>
    {
      var result = await users.CreateAsync(request);
      if (!result.IsSuccess)
        return RouteResults.ToErrorResult(result.Error!);

      return Results.Created($"/users/{result.Value!.Id}", result.Value);
    });
  }
}
