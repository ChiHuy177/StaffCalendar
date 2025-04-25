using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.repositories
{
    public class CheckInRepository : ICheckInRepository
    {
        private readonly UserDataContext _context;

        public CheckInRepository(UserDataContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> Get()
        {
            return await _context.Users.Take(100).ToListAsync();
        }
        public async Task<IEnumerable<string>> GetAllUsersName()
        {
            return await _context.Users
                .Where(e => e.UserId != "NULL")
                .Select(e => e.UserId + " - " + e.FullName)
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetUserByUserId(int month, int year, string userID)
        {
            return await _context.Users.Where(w => w.UserId == userID && w.InAt.HasValue && w.InAt.Value.Month == month && w.InAt.Value.Year == year)
            .OrderBy(w => w.InAt).ToListAsync();
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetAllCheckinInDayRange(DateTime startDate, DateTime endDate)
        {
            return await _context.Users
                .Where(e => e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate)
                .ToListAsync();
        }

        public async Task<int> CountRecordsByMonth(int month, int year, string userId)
        {
            return await _context.Users
                .Where(e => e.UserId == userId && e.InAt.HasValue && e.InAt.Value.Month == month && e.InAt.Value.Year == year)
                .Where(e => EF.Functions.DateDiffHour(e.InAt, e.OutAt) > 6)
                .CountAsync();
        }

        public Task<DataOnly_APIaCheckIn> GetCheckInByDepartmentId(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetByEmailAndDateRange(string email, DateTime startDate, DateTime endDate)
        {
            return await _context.Users.Where(e => e.UserId == email && e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate).ToListAsync();
        }
    }
}
