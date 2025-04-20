
using CalendarWebsite.Server.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

namespace CalendarWebsite.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddDbContext<UserDataContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    policy =>
                    {

                        policy.WithOrigins(
                        "https://localhost:50857",
                        "https://localhost:50858",
                        "https://prismatic-cactus-d90033.netlify.app",
                        "https://calendar-frontend-54y9.onrender.com",
                        "https://calendarwebsite-2.onrender.com").AllowAnyHeader().AllowAnyMethod();

                    });
            });

            var app = builder.Build();

            app.UseCors();
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.MapStaticAssets();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapScalarApiReference();
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
