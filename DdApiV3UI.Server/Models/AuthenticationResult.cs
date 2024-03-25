using System.Text.Json.Serialization;

namespace DdApiV3UI.Server.Models
{
	public class AuthenticationResult
	{
		[JsonPropertyName("token_type")]     public string TokenType    { get; set; } = "Bearer";
		[JsonPropertyName("expires_in")]     public long   ExpiresIn    { get; set; }
		[JsonPropertyName("ext_expires_in")] public long   ExtExpiresIn { get; set; }
		[JsonPropertyName("access_token")]    public string AccessToken  { get; set; } = string.Empty;
	}
}
