using Microsoft.AspNetCore.Mvc;
using PathPilot_AI_API.Services;

var builder = WebApplication.CreateBuilder(args);

const string ViteCorsPolicy = "ViteFrontend";

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var details = new ValidationProblemDetails(context.ModelState)
            {
                Title = "The roadmap request is invalid.",
                Detail = "Review the highlighted fields and submit the request again.",
                Status = StatusCodes.Status400BadRequest,
                Instance = context.HttpContext.Request.Path
            };

            return new BadRequestObjectResult(details);
        };
    });
builder.Services.AddCors(options =>
{
    options.AddPolicy(ViteCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddHttpClient<OpenAIResponsesClient>(client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
    client.Timeout = TimeSpan.FromSeconds(90);
});
builder.Services.AddScoped<MockRoadmapService>();
builder.Services.AddScoped<OpenAIRoadmapService>();
builder.Services.AddScoped<OpenAIReplanRoadmapService>();
builder.Services.AddScoped<IReplanRoadmapService>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    return string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"])
        ? services.GetRequiredService<MockRoadmapService>()
        : services.GetRequiredService<OpenAIReplanRoadmapService>();
});
builder.Services.AddScoped<MockRoadmapExplanationService>();
builder.Services.AddScoped<OpenAIRoadmapExplanationService>();
builder.Services.AddScoped<IRoadmapExplanationService>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    return string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"])
        ? services.GetRequiredService<MockRoadmapExplanationService>()
        : services.GetRequiredService<OpenAIRoadmapExplanationService>();
});
builder.Services.AddScoped<IRoadmapService>(services =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    return string.IsNullOrWhiteSpace(configuration["OpenAI:ApiKey"])
        ? services.GetRequiredService<MockRoadmapService>()
        : services.GetRequiredService<OpenAIRoadmapService>();
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(ViteCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
