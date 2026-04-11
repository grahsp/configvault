namespace KeyVault.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
	RequestDelegate next,
	ILogger<ExceptionHandlingMiddleware> logger)
{
	public async Task InvokeAsync(HttpContext context)
	{
		try
		{
			await next(context);
		}
		catch (Exception ex)
		{
			logger.LogError(ex, "Unhandled exception");
			
			var problem = ProblemDetailsFactory.Create(ex);

			context.Response.StatusCode = problem.Status!.Value;
			await context.Response.WriteAsJsonAsync(problem);
		}
	}
}