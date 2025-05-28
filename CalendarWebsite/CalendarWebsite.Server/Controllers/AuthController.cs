using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.WebUtilities;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private string GetClientUrl()
        {
            var clientUrl = _configuration.GetValue<string>("AppSettings:Production:ClientUrl");
            if (string.IsNullOrEmpty(clientUrl))
            {
                clientUrl = _configuration.GetValue<string>("AppSettings:ClientUrl");
            }
            return clientUrl;
        }

        [HttpGet("user")]
        [Authorize]
        public IActionResult GetUser()
        {
            try
            {
                var user = AuthUser.FromClaims(User.Claims);
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user info: {ex.Message}");

                return BadRequest(ex.Message);
            }
        }

        [HttpGet("ios-user")]
        public IActionResult GetIOSUser([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized();
            }

            try {
                // Giải mã token thay vì xác thực
                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                if (!tokenHandler.CanReadToken(token))
                {
                    return BadRequest("Token không hợp lệ");
                }
                
                // Đọc token mà không xác thực
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                // Lấy claims từ token
                var claims = jwtToken.Claims;
                
                // Tạo đối tượng user từ claims
                var user = AuthUser.FromClaims(claims);
                return Ok(user);
            }
            catch (Exception ex) {
                _logger.LogError($"Error reading token: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("public")]
        public IActionResult GetPublic()
        {
            return Ok("This is a public endpoint");
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
             _logger.LogInformation("Login endpoint called");
           
           // Kiểm tra trình duyệt Firefox từ User-Agent
           var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
           bool isFirefox = userAgent.Contains("Firefox");
           
           if (isFirefox)
           {
               // Xử lý đặc biệt cho Firefox
              var authEndpoint = "https://identity.vntts.vn/connect/authorize";
               
               // Tạo URL redirect trực tiếp thay vì sử dụng Challenge
               
               var nonce = Guid.NewGuid().ToString();
               var state = Guid.NewGuid().ToString();
               
               var callbackUrl = "https://staffcalendarserver-may.onrender.com/api/auth/callback";
               var queryParams = new Dictionary<string, string>
               {
                   ["client_id"] = "wf",
                   ["redirect_uri"] = callbackUrl,
                   ["response_type"] = "code id_token",
                   ["scope"] = "openid profile email",
                   ["response_mode"] = "form_post",
                   ["nonce"] = nonce,
                   ["state"] = state
               };
               
               var redirectUrl = QueryHelpers.AddQueryString(authEndpoint, queryParams);
               return Redirect(redirectUrl);
           }
           else
           {
               // Giữ nguyên phương thức hiện tại cho các trình duyệt khác
               var properties = new AuthenticationProperties
               {
                   RedirectUri = "/api/auth/callback",
               };
               return Challenge(properties, OpenIdConnectDefaults.AuthenticationScheme);
           }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            try
            {
                var token = await HttpContext.GetTokenAsync("access_token");
                _logger.LogInformation($"Received token: {token}");
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest("No token received");
                }

                var environment = HttpContext.RequestServices.GetRequiredService<IHostEnvironment>();
                var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();

                _logger.LogInformation($"Current Environment: {environment.EnvironmentName}");
                _logger.LogInformation($"Development ClientUrl: {configuration.GetValue<string>("AppSettings:ClientUrl")}");
                _logger.LogInformation($"Production ClientUrl: {configuration.GetValue<string>("AppSettings:Production:ClientUrl")}");

                var clientUrl = environment.IsDevelopment()
                    ? configuration.GetValue<string>("AppSettings:ClientUrl")
                    : configuration.GetValue<string>("AppSettings:Production:ClientUrl");

                _logger.LogInformation($"Selected ClientUrl: {clientUrl}");

                if (string.IsNullOrEmpty(clientUrl))
                {
                    throw new InvalidOperationException($"ClientUrl is not configured in {(environment.IsDevelopment() ? "Development" : "Production")} settings");
                }

                return Redirect($"{clientUrl}/?token={token}&callback=processed");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in callback: {ex.Message}");
                return BadRequest($"Error processing callback: {ex.Message}");
            }
        }

        [HttpGet("check-token")]
        [Authorize]
        public IActionResult CheckToken()
        {
            var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var claims = User.Claims.Select(c => new { c.Type, c.Value });

            return Ok(new
            {
                token = token,
                claims = claims,
                isAuthenticated = User.Identity?.IsAuthenticated
            });
        }

        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                _logger.LogInformation("Logout endpoint called");
                var idToken = await HttpContext.GetTokenAsync("id_token");

                // Lấy client URL từ cấu hình
                var clientUrl = GetClientUrl();
                // Xóa cookie authentication ngay lập tức
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                await HttpContext.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);

                // Cấu hình cookie options
                var cookieOptions = new CookieOptions
                {
                    Expires = DateTime.Now.AddDays(-1),
                    Path = "/",
                    Secure = true,
                    HttpOnly = true,
                    SameSite = SameSiteMode.None
                };

                // Xóa tất cả các cookie liên quan đến authentication
                var cookieNames = new[] {
                    "StaffCalendar.Auth",
                    "StaffCalendar.AuthC1",
                    "StaffCalendar.AuthC2",
                    ".AspNetCore.Cookies",
                    ".AspNetCore.OpenIdConnect.Nonce",
                    ".AspNetCore.OpenIdConnect.Correlation"
                };

                var domain = HttpContext.Request.Host.Host;
                if (!domain.Equals("localhost", StringComparison.OrdinalIgnoreCase))
                {
                    cookieOptions.Domain = $".{domain}";
                }

                foreach (var cookieName in cookieNames)
                {
                    if (HttpContext.Request.Cookies.ContainsKey(cookieName))
                    {
                        HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                    }
                }

                // Thêm header để xóa dữ liệu site
                Response.Headers.Append("Clear-Site-Data", "\"cookies\", \"storage\", \"cache\"");


                var state = Guid.NewGuid().ToString();
                var logoutUrl = $"https://identity.vntts.vn/connect/endsession?id_token_hint={idToken}&post_logout_redirect_uri={clientUrl}&state={state}";

                return Ok(new { logoutUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in logout: {ex.Message}");
                return BadRequest(new { message = "Lỗi khi đăng xuất: " + ex.Message });
            }
        }
    }
}

