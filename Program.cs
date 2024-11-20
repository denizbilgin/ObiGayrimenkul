using Microsoft.EntityFrameworkCore;
using Google.Cloud.Firestore;
using System;
using ObiGayrimenkul.Firebase;
using System.Text.Json;
using Google.Api;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ObiGayrimenkul.Services;
using ObiGayrimenkul.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();

// Swagger ayarlarý
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ObiGayrimenkul",
        Version = "v1",
        Description = "ObiGayrimenkul Test"
    });

    // JWT güvenliði için Swagger tanýmlarý
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authentication header. Example: \"Bearer {token}\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// JWT Ayarlarý
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:SecretKey"]);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.ContainsKey("AuthToken"))
            {
                context.Token = context.Request.Cookies["AuthToken"];
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<JwtService>();

// Firestore yapýlandýrmasý
var firebaseJson = File.ReadAllText("Firebase/obidatabase-3e651-firebase-adminsdk-ta9fl-2ef236de49.json");
builder.Services.AddSingleton(_ => new FirestoreProvider(
    new FirestoreDbBuilder
    {
        ProjectId = FirebaseSettings.ProjectId,
        JsonCredentials = firebaseJson
    }.Build()
));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Hata ayýklama için ayrýntýlý hata sayfasý
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ObiGayrimenkul API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHsts();
app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
