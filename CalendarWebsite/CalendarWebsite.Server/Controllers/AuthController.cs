using Microsoft.AspNetCore.Authentication;
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
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }
    }
}
