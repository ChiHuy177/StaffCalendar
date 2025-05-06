using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Mvc;

namespace CalendarWebsite.Server.interfaces
{
    public interface ICheckInDataService
    {
        public Task<IEnumerable<DataOnly_APIaCheckIn>> Get();
        public Task<IEnumerable<string>> GetAllUsersName();
        public Task<(IEnumerable<DataOnly_APIaCheckIn> Items, int TotalCount)> GetUserByUserIdPaging(int month,int year ,string userID, int page, int pageSize);
        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetAllCheckinInDayRange(int day, int month, int year, int dayTo, int monthTo, int yearTo);
        public Task<int> CountRecordsByMonth(int month, int year, string userId);
        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetUserByUserId(int month, int year, string userID);
        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetByDepartment(int id, int day, int month, int year, int dayTo, int monthTo, int yearTo);
    }
}
