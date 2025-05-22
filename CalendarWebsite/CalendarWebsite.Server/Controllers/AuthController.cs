using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _configuration = configuration;
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
            var claims = User.Claims.Select(c => new { c.Type, c.Value });
            return Ok(claims);
        }
        [HttpGet("public")]
        public IActionResult GetPublic()
        {
            return Ok("This is a public endpoint");
        }

        [HttpGet("login")]
        public IActionResult Login()
        {
            try
            {
                var properties = new AuthenticationProperties
                {
                    RedirectUri = "/api/auth/callback",
                };
                return Challenge(properties, OpenIdConnectDefaults.AuthenticationScheme);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            try
            {
                var token = await HttpContext.GetTokenAsync("access_token");
                Console.WriteLine($"Received token: {token}");
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest("No token received");
                }

                // Thêm một tham số để đánh dấu đã xử lý callback
                return Redirect($"https://staff-calendar-5efr.vercel.app/?token={token}&callback=processed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in callback: {ex.Message}");
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
