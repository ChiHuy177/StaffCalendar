using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using Newtonsoft.Json;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomWorkingTimesController : ControllerBase
    {
        private readonly ICustomWorkingTimeService _customWorkingTimeService;

        public CustomWorkingTimesController(ICustomWorkingTimeService context)
        {
            _customWorkingTimeService = context;
        }



        // GET: api/CustomWorkingTimes/5
        [HttpGet("GetAllCustomWorkingTimeByPersonalProfileId")]
        public async Task<ActionResult<IEnumerable<CustomWorkingTimeDTO>>> GetAllCustomWorkingTimeByPersonalProfileId(long id)
        {
            var customWorkingTime = await _customWorkingTimeService.GetAllCustomWorkingTimeByPersonalProfileIdDTO(id);

            if (customWorkingTime == null)
            {
                return NotFound();
            }

            return Ok(customWorkingTime);
        }

        [HttpGet("GetAllCustomWorkingTime")]
        public async Task<ActionResult<IEnumerable<CustomWorkingTimeDTO>>> GetAllCustomWorkingTime()
        {
            var customWorkingTime = await _customWorkingTimeService.GetAllCustomWorkingTimeDTO();

            if (customWorkingTime == null)
            {
                return NotFound();
            }

            return Ok(customWorkingTime);
        }

        [HttpPost("AddCustomWorkingTime")]
        public async Task<IActionResult> AddCustomWorkingTime([FromBody] CustomWorkingTime customWorkingTime)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                Console.WriteLine("Đang thêm CustomWorkingTime. Dữ liệu nhận được:");
                Console.WriteLine(JsonConvert.SerializeObject(customWorkingTime));

                // Kiểm tra workweekId và personalProfileId có tồn tại
                Console.WriteLine($"WorkweekId: {customWorkingTime.WorkweekId}, PersonalProfileId: {customWorkingTime.PersonalProfileId}");

                // Cập nhật thời gian hiện tại cho CreatedTime và LastModified
                if (customWorkingTime.CreatedTime != null && customWorkingTime.CreatedTime.Value.Year > 2024)
                {
                    customWorkingTime.CreatedTime = DateTime.Now;
                    Console.WriteLine("Đã cập nhật CreatedTime thành thời gian hiện tại");
                }

                if (customWorkingTime.LastModified != null && customWorkingTime.LastModified.Value.Year > 2024)
                {
                    customWorkingTime.LastModified = DateTime.Now;
                    Console.WriteLine("Đã cập nhật LastModified thành thời gian hiện tại");
                }

                Console.WriteLine("Dữ liệu sau khi xử lý:");
                Console.WriteLine(JsonConvert.SerializeObject(customWorkingTime));

                await _customWorkingTimeService.AddCustomWorkingTime(customWorkingTime);
                Console.WriteLine("Thêm CustomWorkingTime thành công");
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi thêm CustomWorkingTime: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Lỗi nội bộ: {ex.Message}");
            }
        }

        [HttpDelete("DeleteCustomWorkingTime")]
        public async Task<IActionResult> DeleteCustomWorkingTime(long id)
        {
            if (id == 0)
                return BadRequest("Id is required");
            await _customWorkingTimeService.DeleteCustomWorkingTime(id);
            return Ok();
        }

        [HttpPut("UpdateCustomWorkingTime")]
        public async Task<IActionResult> UpdateCustomWorkingTime([FromBody] CustomWorkingTime customWorkingTime)
        {
            if (customWorkingTime == null)
                return BadRequest("CustomWorkingTime is required");
            
            if (customWorkingTime.Id <= 0)
                return BadRequest("CustomWorkingTime Id is invalid");
            
            if (customWorkingTime.WorkweekId <= 0)
                return BadRequest("WorkweekId is invalid");
            
            if (customWorkingTime.PersonalProfileId <= 0)
                return BadRequest("PersonalProfileId is invalid");

            try
            {
                // Cập nhật thời gian sửa đổi
                customWorkingTime.LastModified = DateTime.Now;
                
                await _customWorkingTimeService.UpdateCustomWorkingTime(customWorkingTime);
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi cập nhật CustomWorkingTime: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Lỗi nội bộ: {ex.Message}");
            }
        }
    }
}
