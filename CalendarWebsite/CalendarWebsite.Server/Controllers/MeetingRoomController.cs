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

        public MeetingRoomController(IMeetingRoomService meetingRoomService)
        {
            this._meetingRoomService = meetingRoomService;
        }

        [HttpGet("GetAllMeetingRoom")]
        public async Task<ActionResult<IEnumerable<MeetingRoom>>> GetAllMeetingRoom()
        {
            var result = await _meetingRoomService.GetAllMeetingRoom();
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("CheckAvailability")]
        public async Task<ActionResult<bool>> CheckRoomAvailability(long meetingRoomId, DateTime start, DateTime end)
        {
            try
            {
                var isAvailable = await _meetingRoomService.IsRoomAvailable(
                    meetingRoomId,
                    start,
                    end
                );
                return Ok(new { isAvailable });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
