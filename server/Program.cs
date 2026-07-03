using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Server.Routes;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
  options.SerializerOptions.Converters.Add(
    new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower));
});

builder.Services.AddOpenApi();

builder.Services.AddDbContext<Server.Data.AppDbContext>(options =>
  options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IUserService, UserService>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
  ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
  options.AddPolicy("Client", policy =>
    policy.WithOrigins(allowedOrigins)
      .AllowAnyHeader()
      .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
  var db = scope.ServiceProvider.GetRequiredService<Server.Data.AppDbContext>();
  db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
  app.MapOpenApi();
}

app.UseCors("Client");
app.UseHttpsRedirection();

app.MapUserRoutes();
app.MapTaskRoutes();

app.Run();

public partial class Program { }
