using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.repositories
{
    public class PersonalProfileRepository : GenericRepository<PersonalProfile>,IPersonalProfileRepository
    {
        // private readonly UserDataContext _context;

        public PersonalProfileRepository(UserDataContext context) : base(context)
        {
            // _context = context;
        }

    }
}
