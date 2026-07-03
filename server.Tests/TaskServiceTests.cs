using Microsoft.Data.Sqlite;
using Server.Data;
using Server.Models;
using Server.Routes;
using Server.Services;

namespace Server.Tests;

public class TaskServiceTests : IDisposable
{
  private readonly SqliteConnection _connection;
  private readonly AppDbContext _db;
  private readonly TaskService _service;

  public TaskServiceTests()
  {
    (_db, _connection) = TestDb.CreateContext();
    _service = new TaskService(_db);

    _db.Users.Add(new User { Name = "Jane" });
    _db.SaveChanges();
  }

  [Fact]
  public async Task GetByUserIdAsync_ReturnsOnlyTasksForUser()
  {
    _db.Users.Add(new User { Name = "Bob" });
    _db.SaveChanges();

    await _service.CreateAsync(new CreateTaskRequest("Jane task", 1));
    await _service.CreateAsync(new CreateTaskRequest("Bob task", 2));

    var tasks = await _service.GetByUserIdAsync(1);

    Assert.Single(tasks);
    Assert.Equal("Jane task", tasks[0].Title);
    Assert.Equal(1, tasks[0].UserId);
  }

  [Fact]
  public async Task CreateAsync_ReturnsBadRequest_WhenUserDoesNotExist()
  {
    var result = await _service.CreateAsync(new CreateTaskRequest("Test", 999));

    Assert.False(result.IsSuccess);
    Assert.Equal(ServiceErrorKind.BadRequest, result.Error!.Kind);
  }

  [Fact]
  public async Task CreateAsync_CreatesTask_WhenUserExists()
  {
    var result = await _service.CreateAsync(new CreateTaskRequest("Buy milk", 1));

    Assert.True(result.IsSuccess);
    Assert.Equal("Buy milk", result.Value!.Title);
    Assert.Equal(TaskItemStatus.NotStarted, result.Value.Status);
  }

  [Fact]
  public async Task UpdateAsync_ReturnsNotFound_WhenTaskDoesNotExist()
  {
    var result = await _service.UpdateAsync(999, new UpdateTaskRequest(Title: "Updated"));

    Assert.False(result.IsSuccess);
    Assert.Equal(ServiceErrorKind.NotFound, result.Error!.Kind);
  }

  [Fact]
  public async Task DeleteAsync_ReturnsFalse_WhenTaskDoesNotExist()
  {
    var deleted = await _service.DeleteAsync(999);

    Assert.False(deleted);
  }

  public void Dispose()
  {
    _db.Dispose();
    _connection.Dispose();
  }
}
