using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Routes;

namespace Server.Services;

public class UserService(AppDbContext db) : IUserService
{
  public async Task<List<UserResponse>> GetAllAsync()
  {
    return await db.Users
      .OrderBy(u => u.Name)
      .Select(u => new UserResponse(u.Id, u.Name))
      .ToListAsync();
  }

  public async Task<UserResponse?> GetByIdAsync(int id)
  {
    return await db.Users
      .Where(u => u.Id == id)
      .Select(u => new UserResponse(u.Id, u.Name))
      .FirstOrDefaultAsync();
  }

  public async Task<ServiceResult<UserResponse>> CreateAsync(CreateUserRequest request)
  {
    var name = request.Name.Trim();

    if (await db.Users.AnyAsync(u => u.Name.ToLower() == name.ToLower()))
      return ServiceResult<UserResponse>.Fail(ServiceErrorKind.Conflict, "A user with that name already exists.");

    var user = new User { Name = name };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return ServiceResult<UserResponse>.Ok(ToResponse(user));
  }

  private static UserResponse ToResponse(User user) =>
    new(user.Id, user.Name);
}
