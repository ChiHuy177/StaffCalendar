using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces.serviceInterfaces
{
    public interface IPersonalProfileService
    {
        public Task<IEnumerable<PersonalProfile>> GetById(long id);

        public Task<IEnumerable<string>> GetAllName();
    }
}
