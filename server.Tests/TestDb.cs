using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Tests;

public static class TestDb
{
  public static (AppDbContext Context, SqliteConnection Connection) CreateContext()
  {
    var connection = new SqliteConnection("DataSource=:memory:");
    connection.Open();

    var options = new DbContextOptionsBuilder<AppDbContext>()
      .UseSqlite(connection)
      .Options;

    var context = new AppDbContext(options);
    context.Database.EnsureCreated();

    return (context, connection);
  }
}
