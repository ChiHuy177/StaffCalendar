using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces.repositoryInterfaces
{
    public interface IPersonalProfileRepository
    {
        public Task<IEnumerable<PersonalProfile>> GetByDepartmentId(long id);

        public Task<IEnumerable<string>> GetAllName();
        
    }
}
