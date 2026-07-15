using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using PathPilot_AI_API.Services;

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "Frontend";

builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance ??= context.HttpContext.Request.Path;
        context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
    };
});
builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(new ValidationProblemDetails(context.ModelState)
    {
        Title = "The roadmap request is invalid.",
        Detail = "Review the supplied fields and submit the request again.",
        Status = StatusCodes.Status400BadRequest,
        Instance = context.HttpContext.Request.Path
    });
});

var configuredOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
var allowedOrigins = configuredOrigins
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToList();
if (builder.Environment.IsDevelopment())
{
    allowedOrigins.AddRange(["http://localhost:5173", "https://localhost:5173"]);
}

builder.Services.AddCors(options => options.AddPolicy(FrontendCorsPolicy, policy =>
{
    if (allowedOrigins.Count > 0)
    {
        policy.WithOrigins(allowedOrigins.Distinct(StringComparer.OrdinalIgnoreCase).ToArray());
    }
    else
    {
        policy.SetIsOriginAllowed(_ => false);
    }
    policy.WithMethods("GET", "POST", "OPTIONS")
        .WithHeaders("Content-Type", "Accept", "Authorization");
}));
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});
builder.Services.AddHttpClient<OpenAIResponsesClient>(client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
    client.Timeout = TimeSpan.FromSeconds(170);
});

builder.Services.AddScoped<MockRoadmapService>();
builder.Services.AddScoped<MockRoadmapExplanationService>();
builder.Services.AddScoped<OpenAIRoadmapService>();
builder.Services.AddScoped<OpenAIReplanRoadmapService>();
builder.Services.AddScoped<OpenAIRoadmapExplanationService>();
builder.Services.AddScoped<UnavailableAIService>();

builder.Services.AddScoped<IRoadmapService>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    if (!string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"]) && !string.IsNullOrWhiteSpace(configuration["OpenAI:Model"])) return services.GetRequiredService<OpenAIRoadmapService>();
    return services.GetRequiredService<IHostEnvironment>().IsDevelopment()
        ? services.GetRequiredService<MockRoadmapService>()
        : services.GetRequiredService<UnavailableAIService>();
});
builder.Services.AddScoped<IReplanRoadmapService>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    if (!string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"]) && !string.IsNullOrWhiteSpace(configuration["OpenAI:Model"])) return services.GetRequiredService<OpenAIReplanRoadmapService>();
    return services.GetRequiredService<IHostEnvironment>().IsDevelopment()
        ? services.GetRequiredService<MockRoadmapService>()
        : services.GetRequiredService<UnavailableAIService>();
});
builder.Services.AddScoped<IRoadmapExplanationService>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    if (!string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"]) && !string.IsNullOrWhiteSpace(configuration["OpenAI:Model"])) return services.GetRequiredService<OpenAIRoadmapExplanationService>();
    return services.GetRequiredService<IHostEnvironment>().IsDevelopment()
        ? services.GetRequiredService<MockRoadmapExplanationService>()
        : services.GetRequiredService<UnavailableAIService>();
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();
app.UseForwardedHeaders();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "PathPilot API" }));
app.MapControllers();
app.Run();
