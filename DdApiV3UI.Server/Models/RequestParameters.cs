using System.Text.Json.Serialization;

namespace DdApiV3UI.Server.Models
{
    public class RequestParameters
    {
        [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
        [JsonPropertyName("apiKey")] public string? ApiKey { get; set; }
        [JsonPropertyName("coordinateSystem")] public string? CoordinateSystem { get; set; }
    }
}
