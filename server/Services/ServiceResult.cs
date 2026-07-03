namespace Server.Services;

public enum ServiceErrorKind
{
  NotFound,
  BadRequest,
  Conflict,
}

public record ServiceError(ServiceErrorKind Kind, string Message);

public readonly struct ServiceResult<T>
{
  public T? Value { get; }
  public ServiceError? Error { get; }
  public bool IsSuccess => Error is null;

  private ServiceResult(T value)
  {
    Value = value;
    Error = null;
  }

  private ServiceResult(ServiceError error)
  {
    Value = default;
    Error = error;
  }

  public static ServiceResult<T> Ok(T value) => new(value);

  public static ServiceResult<T> Fail(ServiceErrorKind kind, string message) =>
    new(new ServiceError(kind, message));
}
