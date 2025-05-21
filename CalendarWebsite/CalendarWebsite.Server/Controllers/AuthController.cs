using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
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
                Console.WriteLine("Đang thực hiện logout...");

                // Xóa tất cả cookie với các domain khác nhau
                var cookieOptions = new CookieOptions
                {
                    Expires = DateTime.Now.AddDays(-1),
                    Path = "/",
                    Secure = true,
                    HttpOnly = true,
                    SameSite = SameSiteMode.None
                };

                // Xóa cookie cho domain hiện tại
                foreach (var cookie in HttpContext.Request.Cookies)
                {
                    HttpContext.Response.Cookies.Delete(cookie.Key, cookieOptions);
                }

                // Xóa cookie cho domain vercel.app
                cookieOptions.Domain = ".vercel.app";
                foreach (var cookie in HttpContext.Request.Cookies)
                {
                    HttpContext.Response.Cookies.Delete(cookie.Key, cookieOptions);
                }

                // Xóa cookie cho domain onrender.com
                cookieOptions.Domain = ".onrender.com";
                foreach (var cookie in HttpContext.Request.Cookies)
                {
                    HttpContext.Response.Cookies.Delete(cookie.Key, cookieOptions);
                }

                // Xóa header Authorization
                HttpContext.Response.Headers.Remove("Authorization");

                // Thêm header để xóa dữ liệu site
                Response.Headers.Add("Clear-Site-Data", "\"cookies\", \"storage\", \"cache\"");

                // Lấy id_token nếu có
                var idToken = await HttpContext.GetTokenAsync("id_token");
                Console.WriteLine($"Received id_token: {idToken}");

                if (!string.IsNullOrEmpty(idToken))
                {
                    // Đăng xuất khỏi OpenID Connect nếu có token
                    var properties = new AuthenticationProperties
                    {
                        RedirectUri = "https://staff-calendar-5efr.vercel.app/",
                        Items =
                        {
                            { "id_token", idToken }
                        }
                    };

                    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                    await HttpContext.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme, properties);

                    return Ok(new
                    {
                        logoutUrl = $"https://identity.vntts.vn/connect/endsession?id_token_hint={idToken}&post_logout_redirect_uri=https://staff-calendar-5efr.vercel.app/"
                    });
                }
                else
                {
                    // Nếu không có token, chỉ cần xóa cookie và chuyển hướng về trang chủ
                    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                    return Ok(new { logoutUrl = "https://staff-calendar-5efr.vercel.app/" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi đăng xuất: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }
    }
}
