using Server.Services;

namespace Server.Routes;

public static class RouteResults
{
  public static IResult ToErrorResult(ServiceError error) => error.Kind switch
  {
    ServiceErrorKind.NotFound => Results.NotFound(),
    ServiceErrorKind.BadRequest => Results.BadRequest(new { error = error.Message }),
    ServiceErrorKind.Conflict => Results.Conflict(new { error = error.Message }),
    _ => Results.BadRequest(new { error = error.Message }),
  };
}
