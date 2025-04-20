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
    public class PersonalProfilesController : ControllerBase
    {
        private readonly UserDataContext _context;

        public PersonalProfilesController(UserDataContext context)
        {
            _context = context;
        }

        // GET: api/PersonalProfiles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PersonalProfile>>> GetPersonalProfiles()
        {
            return await _context.PersonalProfiles.ToListAsync();
        }
        [HttpGet("GetAllUsersName")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllUsersName()
        {
            var uniqueName = await _context.PersonalProfiles
                .Select(e => e.Email + " - " + e.FullName)
                .Distinct()
                .ToListAsync();

            return Ok(uniqueName);

        }
   
        
        // GET: api/PersonalProfiles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PersonalProfile>> GetPersonalProfile(long? id)
        {
            var personalProfile = await _context.PersonalProfiles.FindAsync(id);

            if (personalProfile == null)
            {
                return NotFound();
            }

            return personalProfile;
        }

        // PUT: api/PersonalProfiles/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPersonalProfile(long? id, PersonalProfile personalProfile)
        {
            if (id != personalProfile.Id)
            {
                return BadRequest();
            }

            _context.Entry(personalProfile).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonalProfileExists(id))
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

        // POST: api/PersonalProfiles
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PersonalProfile>> PostPersonalProfile(PersonalProfile personalProfile)
        {
            _context.PersonalProfiles.Add(personalProfile);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPersonalProfile", new { id = personalProfile.Id }, personalProfile);
        }

        // DELETE: api/PersonalProfiles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePersonalProfile(long? id)
        {
            var personalProfile = await _context.PersonalProfiles.FindAsync(id);
            if (personalProfile == null)
            {
                return NotFound();
            }

            _context.PersonalProfiles.Remove(personalProfile);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PersonalProfileExists(long? id)
        {
            return _context.PersonalProfiles.Any(e => e.Id == id);
        }
    }
}
