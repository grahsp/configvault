using KeyVault.Application.ConfigItems.Queries;
using KeyVault.Infrastructure.ConfigItems.Formats;

namespace KeyVault.Tests.Unit.ConfigItems;

public sealed class ImportConfigItemsEndpointTests
{
	[Fact]
	public void Resolve_ShouldReturnEnvParser_ForTextPlainContentType()
	{
		var resolver = new ConfigFormatResolver([new EnvConfigFormat()], [new EnvConfigFormat()]);
		var parser = resolver.GetImporter("text/plain; charset=utf-8");

		Assert.IsType<EnvConfigFormat>(parser);
	}

	[Fact]
	public void Resolve_ShouldThrowUnsupportedMediaType_ForApplicationJson()
	{
		var resolver = new ConfigFormatResolver([new EnvConfigFormat()], [new EnvConfigFormat()]);

		Assert.Throws<UnsupportedMediaTypeException>(() =>
			resolver.GetImporter("application/json"));
	}

	[Fact]
	public void EnvFormat_ShouldParseQuotedAndCommentedEnvContent()
	{
		var format = new EnvConfigFormat();

		var result = format.Parse(
			"""
			# ignored
			API_KEY=secret-value
			MULTILINE="hello\nworld"
			
			"""
		);

		Assert.Equal(
			[
				new ConfigKeyValue("API_KEY", "secret-value"),
				new ConfigKeyValue("MULTILINE", "hello\nworld"),
			],
			result);
	}

	[Fact]
	public void EnvFormat_ShouldExportQuotedValues()
	{
		var format = new EnvConfigFormat();

		var result = format.Export(
		[
			new ConfigKeyValue("API_KEY", "secret-value"),
			new ConfigKeyValue("DATABASE_URL", "postgres://db/app name"),
		]);

		Assert.Equal(
			"""
			API_KEY=secret-value
			DATABASE_URL="postgres://db/app name"
			""",
			result);
	}
}
