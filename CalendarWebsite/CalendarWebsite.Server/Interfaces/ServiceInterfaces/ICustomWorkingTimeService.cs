using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface ICustomWorkingTimeService
    {
        public Task<IEnumerable<CustomWorkingTime>> GetAllCustomWorkingTimeByPersonalProfileId
            (long personalProfileId);

        public Task AddCustomWorkingTime(CustomWorkingTime customWorkingTime);

        public Task DeleteCustomWorkingTime(long id);
    }
}
