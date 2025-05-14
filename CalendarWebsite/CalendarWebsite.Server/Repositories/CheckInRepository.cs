using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.repositories
{
    public class CheckInRepository : GenericRepository<DataOnly_APIaCheckIn>, ICheckInRepository
    {
        // private readonly UserDataContext _context;

        public CheckInRepository(UserDataContext context) : base(context)
        {
            // _context = context;
        }


        public async Task<int> CountRecordsByMonth(int month, int year, string userId)
        {   
            return await _context.Users
                .Where(e => e.UserId == userId && e.InAt.HasValue && e.InAt.Value.Month == month && e.InAt.Value.Year == year)
                .Where(e => EF.Functions.DateDiffHour(e.InAt, e.OutAt) > 4)
                .CountAsync();
        }


    }
}
