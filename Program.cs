using Microsoft.EntityFrameworkCore;
using Google.Cloud.Firestore;
using System;
using ObiGayrimenkul.Firebase;
using System.Text.Json;
using Google.Api;
using Microsoft.OpenApi.Models; 

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();


builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ObiGayrimenkul",
        Version = "v1",
        Description = "ObiGayrimenkul Test"
    });
});

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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
