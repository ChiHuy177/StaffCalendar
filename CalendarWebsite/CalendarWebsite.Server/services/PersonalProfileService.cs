using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.services
{
    public class PersonalProfileService : IPersonalProfileService
    {
        private readonly IPersonalProfileRepository _personalRepository;

        public PersonalProfileService(IPersonalProfileRepository personalRepository)
        {
            _personalRepository = personalRepository;
        }

        public async Task<IEnumerable<string>> GetAllName()
        {
            return await _personalRepository.GetAllName();
        }

        public async Task<IEnumerable<PersonalProfile>> GetById(long id)
        {
            return await _personalRepository.GetByDepartmentId(id);
        }
    }
}
