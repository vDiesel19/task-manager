using Server.Routes;

namespace Server.Services;

public interface IUserService
{
  Task<List<UserResponse>> GetAllAsync();
  Task<UserResponse?> GetByIdAsync(int id);
  Task<ServiceResult<UserResponse>> CreateAsync(CreateUserRequest request);
}
