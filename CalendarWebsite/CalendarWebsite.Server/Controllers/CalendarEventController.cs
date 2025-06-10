using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/events")]
    [ApiController]
    public class CalendarEventController : ControllerBase
    {

        private readonly ICalendarEventService _calendarEventService;

        public CalendarEventController(ICalendarEventService calendarEventService)
        {
            _calendarEventService = calendarEventService;
        }

        [HttpGet("allById")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetAllEventsByUserId(long id)
        {
            var result = await _calendarEventService.GetAllEventByUserId(id);
            return Ok(result);
        }

        [HttpGet("allMeetings")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetAllMeetings(){
            var result = await _calendarEventService.GetAllMeetingEvents();
            return Ok(result);
        }

        [HttpPost("addNew")]
        public async Task<IActionResult> AddNew([FromBody] CreateEventDTO createEventDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var result = await _calendarEventService.CreateEventWithAttendees(createEventDTO);
                return Ok(result);
            } catch (Exception ex) {
                Console.WriteLine($"Lỗi khi thêm Event: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Lỗi nội bộ: {ex.Message}");
            }
        }
    }
}
