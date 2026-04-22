using KeyVault.Api.Configuration;
using Microsoft.Extensions.Options;

namespace KeyVault.Tests.Unit.Configuration;

public sealed class CorsOriginParserTests
{
	[Fact]
	public void Parse_WithSingleOrigin_ReturnsSingleOrigin()
	{
		var origins = CorsOriginParser.Parse("http://localhost:3000");

		Assert.Equal(["http://localhost:3000"], origins);
	}

	[Fact]
	public void Parse_WithMultipleOrigins_ReturnsTrimmedOrigins()
	{
		var origins = CorsOriginParser.Parse("http://localhost:3000, https://app.example.com");

		Assert.Equal(
			["http://localhost:3000", "https://app.example.com"],
			origins);
	}

	[Theory]
	[InlineData("http://localhost:3000,")]
	[InlineData("http://localhost:3000,,https://app.example.com")]
	[InlineData("relative-path")]
	public void Parse_WithInvalidOrigins_ThrowsOptionsValidationException(string allowedOrigins)
	{
		Assert.Throws<OptionsValidationException>(() => CorsOriginParser.Parse(allowedOrigins));
	}

	[Theory]
	[InlineData(null)]
	[InlineData("")]
	[InlineData("   ")]
	public void Parse_WithBlankInput_ReturnsEmptyArray(string? allowedOrigins)
	{
		var origins = CorsOriginParser.Parse(allowedOrigins);

		Assert.Empty(origins);
	}
}
