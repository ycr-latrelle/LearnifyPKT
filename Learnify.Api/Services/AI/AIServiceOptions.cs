namespace Learnify.Api.Services.AI;

public class AIServiceOptions
{
    public string ApiKey { get; set; } = string.Empty;

    public string Model { get; set; } = "openrouter/free";

    public string BaseUrl { get; set; } =
        "https://openrouter.ai/api/v1/";
}