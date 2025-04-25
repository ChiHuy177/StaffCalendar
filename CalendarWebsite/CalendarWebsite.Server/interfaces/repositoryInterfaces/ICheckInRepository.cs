using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.interfaces
{
    public interface ICheckInRepository
    {
        public Task<IEnumerable<DataOnly_APIaCheckIn>> Get();

        public Task<IEnumerable<string>> GetAllUsersName();

        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetUserByUserId(int month, int year, string userID);

        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetAllCheckinInDayRange(DateTime startTime, DateTime endTime);
        public Task<int> CountRecordsByMonth(int month, int year, string userId);

        public Task<DataOnly_APIaCheckIn> GetCheckInByDepartmentId(int id);
        
        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetByEmailAndDateRange(string email, DateTime startDate, DateTime endDate);

    }
}
