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
        private readonly IFileService _fileService;

        public CalendarEventController(ICalendarEventService calendarEventService,
            IFileService fileService)
        {
            _calendarEventService = calendarEventService;
            _fileService = fileService;
        }

        [HttpGet("allById")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetAllEventsByUserId(long id)
        {
            var result = await _calendarEventService.GetAllEventByUserId(id);
            return Ok(result);
        }

        [HttpGet("allMeetings")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetAllMeetings()
        {
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
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi thêm Event: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Lỗi nội bộ: {ex.Message}");
            }
        }

        

        [HttpPost("uploadTempAttachment")]
        public async Task<IActionResult> UploadTempAttachment(IFormFile file)
        {
            try
            {
                // Log thông tin request
                Console.WriteLine("Received upload request");
                Console.WriteLine($"Request headers: {string.Join(", ", Request.Headers.Select(h => $"{h.Key}: {h.Value}"))}");

                if (file == null)
                {
                    Console.WriteLine("File is null");
                    return BadRequest("No file uploaded");
                }

                Console.WriteLine($"File details:");
                Console.WriteLine($"- Name: {file.FileName}");
                Console.WriteLine($"- Size: {file.Length} bytes");
                Console.WriteLine($"- Content Type: {file.ContentType}");

                var tempFileName = await _fileService.SaveTempFile(file);
                Console.WriteLine($"File saved as: {tempFileName}");

                return Ok(new { tempFileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UploadTempAttachment:");
                Console.WriteLine($"- Message: {ex.Message}");
                Console.WriteLine($"- Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"- Inner Exception: {ex.InnerException.Message}");
                }
                return BadRequest($"Error uploading file: {ex.Message}");
            }
        }

        [HttpPost("deleteTempAttachment")]
        public async Task<IActionResult> DeleteTempAttachment(string tempFileName)
        {
            try
            {
                await _fileService.DeleteTempFile(tempFileName);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("moveTempToPermanent")]
        public async Task<IActionResult> MoveTempToPermanent(long eventId, string tempFileName, string originalFileName, string fileType, long fileSize)
        {
            try
            {
                var attachment = await _fileService.MoveTempToPermanent(eventId, tempFileName, originalFileName, fileType, fileSize);
                return Ok(attachment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("attachments/{eventId}")]
        public async Task<IActionResult> GetEventAttachments(long eventId)
        {
            try
            {
                var attachments = await _fileService.GetAttachmentsByEventId(eventId);
                return Ok(attachments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
