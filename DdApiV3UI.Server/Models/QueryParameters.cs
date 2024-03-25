namespace DdApiV3UI.Server.Models
{
	public class QueryParameters
	{
		public string  DdApiBaseUrl      { get; set; } = string.Empty;
		public string? DdApiQueryUrl     { get; set; }
		public string? AuthenticationUrl { get; set; }
		public string? ClientId          { get; set; }
		public string? ClientSecret      { get; set; }
		public string? GrantType         { get; set; }
		public string? Scope             { get; set; }
	}
}
