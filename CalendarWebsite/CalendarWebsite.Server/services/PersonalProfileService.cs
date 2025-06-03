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

        public async Task<IEnumerable<object>> GetAllName()
        {
            var result = (await _personalRepository.FindListSelect(
                predicate: each => each.Email != null && each.FullName != null,
                selector: each => new
                {
                    EmailAndName = each.Email + " - " + each.FullName,
                    PersonalProfileId = each.Id
                },
                distinct: true,
                disableTracking: true
            )).GroupBy(x => x.EmailAndName)
                .Select(g => g.First())
                .ToList();
            return result;
        }

        public async Task<PersonalProfile> GetById(long id)
        {
            return await _personalRepository.GetByIdAsync(id);
        }

        public async Task<string> GetNameById(long id)
        {
            var result = await _personalRepository.FindOneSelect(
                predicate: each => each.Id == id,
                selector: each => new
                {
                    Name = each.FullName
                },
                disableTracking: true
            );
            return result.Name;
        }
    }
}
