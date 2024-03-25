using System.Text.Json.Serialization;

namespace DdApiV3UI.Server.Models;

public class DefaultSettings
{
  [JsonPropertyName("ddApiBaseUrl")]      public string? DdApiBaseUrl      { set; get; }
  [JsonPropertyName("authenticationUrl")] public string? AuthenticationUrl { set; get; }
  [JsonPropertyName("clientId")]          public string? ClientId          { set; get; }
  [JsonPropertyName("clientSecret")]      public string? ClientSecret      { set; get; }
  [JsonPropertyName("scope")]             public string? Scope             { set; get; }
  [JsonPropertyName("grantType")]         public string? GrantType         { set; get; }
}