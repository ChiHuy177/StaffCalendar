
using Microsoft.AspNetCore.Mvc;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.interfaces;


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

        [HttpGet("GetUserByUserIdPaging")]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetUserByUserIdPaging(int month, int year, string userID, int page = 0, int pageSize = 10)
        {
            var (items, totalCount) = await _checkInDataService.GetUserByUserIdPaging(month, year, userID, page, pageSize);
            if (items == null || !items.Any())
            {
                return NotFound();
            }

            return Ok(new
            {
                items,
                totalCount
            });

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
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetAllCheckinInDayRange(int day, int month, int year, int dayTo, int monthTo, int yearTo, int page, int pageSize)
        {

            var (items, totalCount) = await _checkInDataService.GetAllCheckinInDayRangePaging(day, month, year, dayTo, monthTo, yearTo, page, pageSize);
            if (items == null || !items.Any())
            {
                return NotFound();
            }

            return Ok(new
            {
                items,
                totalCount
            });
        }

        [HttpGet("CountRecordsByMonth")]
        public async Task<ActionResult<int>> CountRecordsByMonth(int month, int year, string userId)
        {
            return await _checkInDataService.CountRecordsByMonth(month, year, userId);
        }



        [HttpGet("GetCheckInByDepartmentId")]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> GetCheckInByDepartmentId(int id, string userId, int day, int month, int year, int dayTo, int monthTo, int yearTo, int page, int pageSize)
        {
            var (items, totalCount) = await _checkInDataService.GetByDepartmentPaging(id, userId, day, month, year, dayTo, monthTo, yearTo, page, pageSize);
            if (items == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                items,
                totalCount
            });
        }
        [HttpGet("GetAllFullNameByDepartmentId")]
        public async Task<ActionResult<string>> GetAllFullNameByDepartmentId(int id)
        {
            var result = await _checkInDataService.GetAllUserFullNameByDepartmentId(id);
            return result == null ? NotFound() : Ok(result);
        }

    }
}
