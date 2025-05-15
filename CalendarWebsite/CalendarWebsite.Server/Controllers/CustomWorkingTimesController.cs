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
        public async Task<ActionResult<IEnumerable<CustomWorkingTime>>> GetAllCustomWorkingTimeByPersonalProfileId(long id)
        {
            var customWorkingTime = await _customWorkingTimeService.GetAllCustomWorkingTimeByPersonalProfileId(id);

            if (customWorkingTime == null)
            {
                return NotFound();
            }

            return Ok(customWorkingTime);
        }

        [HttpPost("AddCustomWorkingTime")]
        public async Task<IActionResult> AddCustomWorkingTime([FromBody] CustomWorkingTime customWorkingTime)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            Console.WriteLine(JsonConvert.SerializeObject(customWorkingTime));
            await _customWorkingTimeService.AddCustomWorkingTime(customWorkingTime);
            return Ok();
        }

        [HttpDelete("DeleteCustomWorkingTime")]
        public async Task<IActionResult> DeleteCustomWorkingTime(long id)
        {
            if (id == 0)
                return BadRequest("Id is required");
            await _customWorkingTimeService.DeleteCustomWorkingTime(id);
            return Ok();
        }


    }
}
