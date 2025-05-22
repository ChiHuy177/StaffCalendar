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

            builder.Services.AddLogging(logging =>
            {
                logging.AddConsole();
                logging.AddDebug();
            });
            builder.Services.AddSingleton<ILogger>(sp => sp.GetRequiredService<ILogger<Program>>());

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
                options.Events = new CookieAuthenticationEvents
                {
                    OnSigningOut = context =>
                    {
                        var cookieNames = new[] { "StaffCalendar.Auth", "StaffCalendar.AuthC1", "StaffCalendar.AuthC2" };
                        var cookieOptions = new CookieOptions
                        {
                            Expires = DateTime.Now.AddDays(-1),
                            Path = "/",
                            Secure = true,
                            HttpOnly = true,
                            SameSite = SameSiteMode.None,
                            Domain = context.HttpContext.Request.Host.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ? null : $".{context.HttpContext.Request.Host.Host}"
                        };
                        foreach (var cookieName in cookieNames)
                        {
                            context.HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                        }
                        return Task.CompletedTask;
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
                        var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger>();
                        logger.LogError("OIDC Authentication failed: {Message}", context.Exception.Message);
                        context.Response.StatusCode = 401;
                        context.Response.WriteAsync($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    }
                };
            })
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
            {
                var clientUrl = builder.Configuration.GetValue<string>("AppSettings:Production:ClientUrl");
                // var clientUrl = builder.Configuration.GetValue<string>("AppSettings:ClientUrl");
                if (string.IsNullOrEmpty(clientUrl))
                {
                    clientUrl = builder.Configuration.GetValue<string>("AppSettings:ClientUrl");
                }
                if (string.IsNullOrEmpty(clientUrl))
                {
                    throw new InvalidOperationException("ClientUrl is not configured in either Production or Development settings");
                }

                var serverUrl = builder.Configuration.GetValue<string>("AppSettings:Production:ServerUrl");
                if (string.IsNullOrEmpty(serverUrl))
                {
                    serverUrl = builder.Configuration.GetValue<string>("AppSettings:ServerUrl");
                }
                if (string.IsNullOrEmpty(serverUrl))
                {
                    // Fallback to determine server URL from the current host
                    serverUrl = "https://staffcalendarserver-may.onrender.com";
                }

                options.Authority = builder.Configuration["IdentityServerConfig:Authority"];
                options.ClientId = builder.Configuration["IdentityServerConfig:ClientId"];
                options.ClientSecret = builder.Configuration["IdentityServerConfig:ClientSecret"];
                options.ResponseType = builder.Configuration["IdentityServerConfig:ResponseType"] ?? string.Empty;
                options.SaveTokens = builder.Configuration.GetValue<bool>("IdentityServerConfig:SaveTokens");
                options.GetClaimsFromUserInfoEndpoint = builder.Configuration.GetValue<bool>("IdentityServerConfig:GetClaimsFromUserInfoEndpoint");
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.CallbackPath = "/signin-oidc";
                options.RequireHttpsMetadata = builder.Configuration.GetValue<bool>("IdentityServerConfig:RequireHttpsMetadata");
                options.SignedOutCallbackPath = "/signout-callback-oidc";
                options.SignedOutRedirectUri = $"{clientUrl}";
                options.UseTokenLifetime = true;
                options.SkipUnrecognizedRequests = true;
                options.NonceCookie.SecurePolicy = CookieSecurePolicy.Always;
                options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;

                options.Events = new OpenIdConnectEvents
                {
                    OnRedirectToIdentityProvider = context =>
                    {
                        if (string.IsNullOrEmpty(clientUrl))
                        {
                            throw new InvalidOperationException("ClientUrl is not configured properly");
                        }

                        // Đảm bảo rằng redirect URI trỏ đến server API và luôn sử dụng HTTPS
                        var redirectUri = $"https://{context.Request.Host}/signin-oidc";
                        context.ProtocolMessage.RedirectUri = redirectUri;

                        Console.WriteLine($"Redirecting to: {context.ProtocolMessage.IssuerAddress}");
                        Console.WriteLine($"Redirect URI: {context.ProtocolMessage.RedirectUri}");
                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"OIDC Authentication failed: {context.Exception.Message}");
                        context.Response.StatusCode = 401;
                        context.Response.WriteAsync($"Authentication failed: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token validated successfully");
                        Console.WriteLine($"Token type: {context.TokenEndpointResponse?.TokenType}");
                        return Task.CompletedTask;
                    },
                    OnSignedOutCallbackRedirect = context =>
                    {
                        context.Response.Redirect($"{clientUrl}");
                        context.HandleResponse();
                        return Task.CompletedTask;
                    },
                    OnRedirectToIdentityProviderForSignOut = context =>
                    {
                        // Thêm id_token vào request
                        var idToken = context.ProtocolMessage.IdTokenHint;
                        if (!string.IsNullOrEmpty(idToken))
                        {
                            context.ProtocolMessage.IdTokenHint = idToken;
                        }
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

                        policy.WithOrigins(
                            "https://localhost:50857",
                            "https://localhost:50858",
                            "https://prismatic-cactus-d90033.netlify.app",
                            "https://calendar-frontend-54y9.onrender.com",
                            "https://calendarwebsite-2.onrender.com",
                            "https://staffcalendar.vercel.app",
                            "https://staff-calendar-5efr.vercel.app",
                            "https://staffcalendarserver-may.onrender.com",
                            "http://staffcalendarserver-may.onrender.com",
                            "https://identity.vntts.vn"
                        ).AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();

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

            app.UseAuthentication();
            //app.UseAuthorization();
            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}