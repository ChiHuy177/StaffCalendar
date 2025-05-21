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
            
            var token = await HttpContext.GetTokenAsync("access_token");
            Console.WriteLine($"Received token: {token}");
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("No token received");
            }

            // Thêm một tham số để đánh dấu đã xử lý callback
            return Redirect($"https://staff-calendar-5efr.vercel.app/?token={token}&callback=processed");
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
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // Lấy id_token từ cookie
                var idToken = await HttpContext.GetTokenAsync("id_token");
                if (string.IsNullOrEmpty(idToken))
                {
                    return BadRequest(new { message = "Không tìm thấy id_token" });
                }

                // Lấy client URL từ cấu hình
                var clientUrl = GetClientUrl();

                // Xóa cookie authentication trước
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                await HttpContext.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);

                // Cấu hình cookie options
                var cookieOptions = new CookieOptions
                {
                    Expires = DateTime.Now.AddDays(-1),
                    Path = "/",
                    Secure = true,
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax
                };

                // Xóa các cookie authentication cụ thể
                var cookieNames = new[] { "StaffCalendar.Auth", "StaffCalendar.AuthC1", "StaffCalendar.AuthC2" };

                // Xóa cookie cho domain vercel.app
                cookieOptions.Domain = ".vercel.app";
                foreach (var cookieName in cookieNames)
                {
                    HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                }

                // Xóa cookie cho domain onrender.com
                cookieOptions.Domain = ".onrender.com";
                foreach (var cookieName in cookieNames)
                {
                    HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                }

                // Xóa cookie cho domain localhost
                cookieOptions.Domain = "localhost";
                foreach (var cookieName in cookieNames)
                {
                    HttpContext.Response.Cookies.Delete(cookieName, cookieOptions);
                }

                // Thêm header để xóa dữ liệu site
                Response.Headers.Add("Clear-Site-Data", "\"cookies\", \"storage\", \"cache\"");

                // Tạo URL đăng xuất của Identity Server với state parameter và thêm các tham số cho Safari
                var state = Guid.NewGuid().ToString();
                var logoutUrl = $"https://identity.vntts.vn/connect/endsession?id_token_hint={idToken}&post_logout_redirect_uri={clientUrl}&state={state}&ui_locales=vi";

                return Ok(new { logoutUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi đăng xuất: " + ex.Message });
            }
        }
    }
}
