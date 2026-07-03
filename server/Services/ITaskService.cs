using Server.Routes;

namespace Server.Services;

public interface ITaskService
{
  Task<List<TaskResponse>> GetByUserIdAsync(int userId);
  Task<ServiceResult<TaskResponse>> CreateAsync(CreateTaskRequest request);
  Task<ServiceResult<TaskResponse>> UpdateAsync(int id, UpdateTaskRequest request);
  Task<bool> DeleteAsync(int id);
}
