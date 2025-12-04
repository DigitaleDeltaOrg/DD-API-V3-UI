using System.Text.Json.Serialization;

namespace DdApiV3UI.Server.Models;

public class AppSettings
{
    [JsonPropertyName("baseUrls")] public List<string> BaseUrls { set; get; } = [];
    [JsonPropertyName("endPoints")] public List<EndPoint> EndPoints { set; get; } = [];
}