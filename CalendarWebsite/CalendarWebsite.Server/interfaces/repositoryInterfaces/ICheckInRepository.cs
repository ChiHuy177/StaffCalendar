using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;


namespace CalendarWebsite.Server.interfaces
{
    public interface ICheckInRepository : IGenericRepository<DataOnly_APIaCheckIn>
    {
        public Task<int> CountRecordsByMonth(int month, int year, string userId);
        
    }
}
