using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataOnly_APIaCheckInController : ControllerBase
    {
        // private readonly UserDataContext _context;
        private readonly ICheckInDataService _checkInDataService;

        public DataOnly_APIaCheckInController(ICheckInDataService checkInDataService)
        {
            // _context = context;
            _checkInDataService = checkInDataService;

        }

        // GET: api/DataOnly_APIaCheckIn
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetUsers()
        {
            var result = await _checkInDataService.Get();
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("GetUserByUserId")]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetUserByUserId(int month, int year, string userID)
        {
            var result = await _checkInDataService.GetUserByUserId(month, year, userID);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("GetAllUsersName")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllUsersName()
        {
            var result = await _checkInDataService.GetAllUsersName();
            return result == null ? NotFound() : Ok(result);

        }

        [HttpGet("GetAllCheckinInDayRange")]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetAllCheckinInDayRange(int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {

            var result = await _checkInDataService.GetAllCheckinInDayRange(day, month, year, dayTo, monthTo, yearTo);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("CountRecordsByMonth")]
        public async Task<ActionResult<int>> CountRecordsByMonth(int month, int year, string userId)
        {
            return await _checkInDataService.CountRecordsByMonth(month, year, userId);
        }


        // [HttpGet("GetAllCheckinInDay")]
        // public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetAllCheckinInDay(int day, int month, int year)
        // {
        //     var result = await _context.Users.Where(e => e.At.HasValue && e.At.Value.Day == day && e.At.HasValue && e.At.Value.Month == month && e.At.Value.Year == year)
        //         .ToListAsync();
        //     return Ok(result);
        // }



        [HttpGet("GetCheckInByDepartmentId")]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> GetCheckInByDepartmentId(int id, int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            var result = await _checkInDataService.GetByDepartment(id, day, month, year, dayTo, monthTo, yearTo);
            return result == null ? NotFound() : Ok(result);
        }

    }
}
