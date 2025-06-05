using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingRoomController : ControllerBase
    {
        private readonly IMeetingRoomService _meetingRoomService;

        public MeetingRoomController(IMeetingRoomService meetingRoomService){
            this._meetingRoomService = meetingRoomService;
        }

        [HttpGet("GetAllMeetingRoom")]
        public  async Task<ActionResult<IEnumerable<MeetingRoom>>> GetAllMeetingRoom(){
            var result = await _meetingRoomService.GetAllMeetingRoom();
            return result == null ? NotFound() : Ok(result);
        }
    }
}
