namespace KeyVault.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next)
{
	public async Task InvokeAsync(HttpContext context)
	{
		try
		{
			await next(context);
		}
		catch (Exception ex)
		{
			var problem = ProblemDetailsFactory.Create(ex);

			context.Response.StatusCode = problem.Status!.Value;
			await context.Response.WriteAsJsonAsync(problem);
		}
	}
}