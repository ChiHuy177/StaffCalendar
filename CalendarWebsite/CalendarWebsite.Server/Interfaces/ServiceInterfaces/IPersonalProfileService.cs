using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces.serviceInterfaces
{
    public interface IPersonalProfileService
    {
        public Task<IEnumerable<object>> GetAllName();

        public Task<string> GetNameById(long id);
    }
}
