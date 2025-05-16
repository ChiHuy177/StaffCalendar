
using Microsoft.AspNetCore.Mvc;
using CalendarWebsite.Server.interfaces.serviceInterfaces;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PersonalProfilesController : ControllerBase
    {

        private readonly IPersonalProfileService _personalProfileService;

        public PersonalProfilesController(IPersonalProfileService personalProfileService)
        {
            _personalProfileService = personalProfileService;
        }


        [HttpGet("GetAllUsersName")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllUsersName()
        {
            var result = await _personalProfileService.GetAllName();
            return result == null ? NotFound() : Ok(result);
        }
        [HttpGet("GetNameById")]
        public async Task<ActionResult<string>> GetNameById(long id)
        {
            var result = await _personalProfileService.GetNameById(id);
            return result == null ? NotFound() : Ok(result);
        }
    }
}
