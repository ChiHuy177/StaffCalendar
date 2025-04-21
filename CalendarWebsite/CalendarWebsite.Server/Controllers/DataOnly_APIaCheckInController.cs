using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataOnly_APIaCheckInController : ControllerBase
    {
        private readonly UserDataContext _context;

        public DataOnly_APIaCheckInController(UserDataContext context)
        {
            _context = context;
        }

        // GET: api/DataOnly_APIaCheckIn
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetUsers()
        {
            return await _context.Users.Where(w => w.UserId == "duydd1@vntt.com.vn").ToListAsync();
        }

        [HttpGet("GetUserByUserId")]
        public async Task<ActionResult<IEnumerable<DataOnly_APIaCheckIn>>> GetUserByUserId(int month,int year ,string userID)
        {
            return await _context.Users.Where(w => w.UserId == userID && w.InAt.HasValue && w.InAt.Value.Month == month && w.InAt.Value.Year == year)
            .OrderBy(w => w.InAt).ToListAsync();
        }

        [HttpGet("GetAllUsersName")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllUsersName()
        {
            var uniqueName = await _context.Users
                .Where(e => e.UserId != "NULL")
                .Select(e => e.UserId + " - " + e.FullName)
                .Distinct()
                .ToListAsync();

            return Ok(uniqueName);

        }
        [HttpGet("CountRecordsByMonth")]
        public async Task<ActionResult<int>> CountRecordsByMonth(int month, int year, string userId)
        {
            var count = await _context.Users
                .Where(e => e.UserId == userId && e.InAt.HasValue && e.InAt.Value.Month == month && e.InAt.Value.Year == year)
                .Where(e => EF.Functions.DateDiffHour(e.InAt, e.OutAt) > 6)
                .CountAsync();

            return Ok(count);
        }

        [HttpGet("GetAllCheckinInDay")]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> GetAllCheckinInDay(int day, int month, int year)
        {
            var result = await _context.Users.Where(e => e.At.HasValue && e.At.Value.Day == day && e.At.HasValue && e.At.Value.Month == month && e.At.Value.Year == year)
                .ToListAsync();
            return Ok(result);
        }

        [HttpGet("GetCheckInByDepartmentId")]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> GetCheckInByDepartmentId(int id, int day, int month, int year)
        {
            var users = await _context.PersonalProfiles.Where(w => w.DepartmentId == id).ToListAsync();
            List<DataOnly_APIaCheckIn> result = new List<DataOnly_APIaCheckIn>();
            foreach (var user in users) {
                var foundUser = await _context.Users.Where(e => e.UserId == user.Email && e.At.HasValue && e.At.Value.Day == day && e.At.HasValue && e.At.Value.Month == month && e.At.Value.Year == year).FirstOrDefaultAsync();
                if (foundUser != null)
                {
                    result.Add(foundUser);
                }
            }
            return Ok(result);
        }

        // GET: api/DataOnly_APIaCheckIn/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> GetDataOnly_APIaCheckIn(long id)
        {
            var dataOnly_APIaCheckIn = await _context.Users.FindAsync(id);

            if (dataOnly_APIaCheckIn == null)
            {
                return NotFound();
            }

            return dataOnly_APIaCheckIn;
        }

        // PUT: api/DataOnly_APIaCheckIn/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDataOnly_APIaCheckIn(long id, DataOnly_APIaCheckIn dataOnly_APIaCheckIn)
        {
            if (id != dataOnly_APIaCheckIn.Id)
            {
                return BadRequest();
            }

            _context.Entry(dataOnly_APIaCheckIn).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DataOnly_APIaCheckInExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/DataOnly_APIaCheckIn
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<DataOnly_APIaCheckIn>> PostDataOnly_APIaCheckIn(DataOnly_APIaCheckIn dataOnly_APIaCheckIn)
        {
            _context.Users.Add(dataOnly_APIaCheckIn);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDataOnly_APIaCheckIn", new { id = dataOnly_APIaCheckIn.Id }, dataOnly_APIaCheckIn);
        }

        // DELETE: api/DataOnly_APIaCheckIn/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDataOnly_APIaCheckIn(long id)
        {
            var dataOnly_APIaCheckIn = await _context.Users.FindAsync(id);
            if (dataOnly_APIaCheckIn == null)
            {
                return NotFound();
            }

            _context.Users.Remove(dataOnly_APIaCheckIn);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DataOnly_APIaCheckInExists(long id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
