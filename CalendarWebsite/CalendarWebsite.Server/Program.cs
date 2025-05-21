using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.repositories;
using CalendarWebsite.Server.Repositories;
using CalendarWebsite.Server.services;
using CalendarWebsite.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

namespace CalendarWebsite.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                options.Cookie.Name = "StaffCalendar.Auth";
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.None;
                options.ExpireTimeSpan = TimeSpan.FromHours(1);
                options.SlidingExpiration = true;
                options.Cookie.Domain = ".vercel.app";
                options.Events = new CookieAuthenticationEvents
                {
                    OnSigningOut = async context =>
                    {
                        // Xóa tất cả cookie authentication
                        var cookieNames = new[] { "StaffCalendar.Auth", "StaffCalendar.AuthC1", "StaffCalendar.AuthC2" };
                        var cookieOptions = new CookieOptions
                        {
                            Expires = DateTime.Now.AddDays(-1),
                            Path = "/",
                            Secure = true,
                            HttpOnly = true,
                            SameSite = SameSiteMode.None,
                            Domain = ".vercel.app"
                        };

                        foreach (var cookieName in cookieNames)
                        {
                            context.HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                        }

                        // Xóa cookie cho domain onrender.com
                        cookieOptions.Domain = ".onrender.com";
                        foreach (var cookieName in cookieNames)
                        {
                            context.HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                        }

                        // Xóa cookie cho domain localhost
                        cookieOptions.Domain = "localhost";
                        foreach (var cookieName in cookieNames)
                        {
                            context.HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                        }
                    }
                };
            })
            .AddJwtBearer(option =>
            {
                option.Authority = builder.Configuration["IdentityServerConfig:Authority"];
                option.Audience = builder.Configuration["IdentityServerConfig:ClientId"];
                option.RequireHttpsMetadata = builder.Configuration.GetValue<bool>("IdentityServerConfig:RequireHttpsMetadata");
                option.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                };
                option.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"JWT Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    }
                };
            })
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
            {
                options.Authority = builder.Configuration["IdentityServerConfig:Authority"];
                options.ClientId = builder.Configuration["IdentityServerConfig:ClientId"];
                options.ClientSecret = builder.Configuration["IdentityServerConfig:ClientSecret"];
                options.ResponseType = builder.Configuration["IdentityServerConfig:ResponseType"] ?? string.Empty;
                options.SaveTokens = true;
                options.GetClaimsFromUserInfoEndpoint = builder.Configuration.GetValue<bool>("IdentityServerConfig:GetClaimsFromUserInfoEndpoint");
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.CallbackPath = "/signin-oidc";
                options.RequireHttpsMetadata = builder.Configuration.GetValue<bool>("IdentityServerConfig:RequireHttpsMetadata");
                options.SignedOutCallbackPath = "/signout-callback-oidc";
                options.SignedOutRedirectUri = builder.Configuration["AppSettings:ClientUrl"];
                options.UseTokenLifetime = true;

                options.Events = new OpenIdConnectEvents
                {
                    OnRedirectToIdentityProvider = context =>
                    {
                        var redirectUri = $"https://{context.Request.Host}/signin-oidc";
                        context.ProtocolMessage.RedirectUri = redirectUri;
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        context.Response.StatusCode = 401;
                        context.Response.WriteAsync($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();
            // add datacontext
            builder.Services.AddDbContext<UserDataContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            //register repository
            builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            builder.Services.AddScoped<ICheckInRepository, CheckInRepository>();
            builder.Services.AddScoped<IDeparmentRepository, DepartmentRepository>();
            builder.Services.AddScoped<IPersonalProfileRepository, PersonalProfileRepository>();
            builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
            builder.Services.AddScoped<IWorkWeekRepository, WorkWeekRepository>();
            builder.Services.AddScoped<ICustomWorkingTimeRepository, CustomWorkingTimeRepository>();

            //register service

            builder.Services.AddScoped<ICheckInDataService, APICheckInService>();
            builder.Services.AddScoped<IDepartmentService, DepartmentService>();
            builder.Services.AddScoped<IPersonalProfileService, PersonalProfileService>();
            builder.Services.AddScoped<IExportService, ExportService>();
            builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();
            builder.Services.AddScoped<IWorkingWeekService, WorkWeekService>();
            builder.Services.AddScoped<ICustomWorkingTimeService, CustomWorkingTimeService>();

            //add CORS
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    policy =>
                    {
                        policy.SetIsOriginAllowed(origin => true)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    });
            });

            var app = builder.Build();

            // Cấu hình middleware
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

            app.UseAuthentication();
            //app.UseAuthorization();
            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
