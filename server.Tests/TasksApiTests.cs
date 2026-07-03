using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Server.Data;
using Server.Routes;

namespace Server.Tests;

public class TasksApiTests : IClassFixture<TasksApiFactory>
{
  private static readonly JsonSerializerOptions JsonOptions = new()
  {
    PropertyNameCaseInsensitive = true,
    Converters = { new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower) },
  };

  private readonly HttpClient _client;

  public TasksApiTests(TasksApiFactory factory)
  {
    _client = factory.CreateClient();
  }

  [Fact]
  public async Task GetTasks_ReturnsBadRequest_WhenUserIdIsMissing()
  {
    var response = await _client.GetAsync("/tasks");

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
  }

  [Fact]
  public async Task GetTasks_ReturnsOnlyTasksForUser()
  {
    var janeName = $"jane-{Guid.NewGuid():N}";
    var bobName = $"bob-{Guid.NewGuid():N}";

    var janeResponse = await _client.PostAsJsonAsync("/users", new CreateUserRequest(janeName));
    var jane = await janeResponse.Content.ReadFromJsonAsync<UserResponse>(JsonOptions);
    var bobResponse = await _client.PostAsJsonAsync("/users", new CreateUserRequest(bobName));
    var bob = await bobResponse.Content.ReadFromJsonAsync<UserResponse>(JsonOptions);

    Assert.Equal(HttpStatusCode.Created, janeResponse.StatusCode);
    Assert.Equal(HttpStatusCode.Created, bobResponse.StatusCode);

    await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("Jane task", jane!.Id));
    await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("Bob task", bob!.Id));

    var response = await _client.GetAsync($"/tasks?userId={jane.Id}");
    var tasks = await response.Content.ReadFromJsonAsync<List<TaskResponse>>(JsonOptions);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Single(tasks!);
    Assert.Equal("Jane task", tasks![0].Title);
    Assert.Equal(jane.Id, tasks[0].UserId);
  }

  [Fact]
  public async Task CreateTask_ReturnsBadRequest_WhenUserDoesNotExist()
  {
    var response = await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("Test", 999));

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
  }

  [Fact]
  public async Task CreateTask_ReturnsCreated_WhenUserExists()
  {
    var userName = $"user-{Guid.NewGuid():N}";
    var userResponse = await _client.PostAsJsonAsync("/users", new CreateUserRequest(userName));
    var user = await userResponse.Content.ReadFromJsonAsync<UserResponse>(JsonOptions);

    Assert.Equal(HttpStatusCode.Created, userResponse.StatusCode);

    var response = await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("Buy milk", user!.Id));
    var task = await response.Content.ReadFromJsonAsync<TaskResponse>(JsonOptions);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    Assert.Equal("Buy milk", task!.Title);
  }
}

public class TasksApiFactory : WebApplicationFactory<Program>
{
  private SqliteConnection? _connection;

  protected override void ConfigureWebHost(IWebHostBuilder builder)
  {
    builder.ConfigureServices(services =>
    {
      var descriptors = services
        .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>)
          || d.ServiceType == typeof(AppDbContext))
        .ToList();

      foreach (var descriptor in descriptors)
        services.Remove(descriptor);

      _connection = new SqliteConnection("DataSource=:memory:");
      _connection.Open();

      services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
    });
  }

  protected override void Dispose(bool disposing)
  {
    base.Dispose(disposing);
    _connection?.Dispose();
  }
}
