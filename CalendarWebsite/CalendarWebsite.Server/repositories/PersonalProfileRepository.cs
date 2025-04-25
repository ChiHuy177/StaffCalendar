using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.repositories
{
    public class PersonalProfileRepository : IPersonalProfileRepository
    {
        private readonly UserDataContext _context;

        public PersonalProfileRepository(UserDataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<string>> GetAllName()
        {
            var result = await _context.PersonalProfiles
                .Select(e => e.Email + " - " + e.FullName)
                .Distinct()
                .ToListAsync();
            return result;
        }

        public async Task<IEnumerable<PersonalProfile>> GetByDepartmentId(long id)
        {
            return await _context.PersonalProfiles.Where(w => w.DepartmentId == id).ToListAsync();
        }
    }
}
