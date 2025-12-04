using System.Text.Json.Serialization;

namespace DdApiV3UI.Server.Models
{
    public class EndPoint
    {
        [JsonPropertyName("text")] public string Text { set; get; } = string.Empty;
        [JsonPropertyName("property")] public string Property { set; get; } = string.Empty;
        [JsonPropertyName("url")] public string Url { set; get; } = string.Empty;
    }
}
