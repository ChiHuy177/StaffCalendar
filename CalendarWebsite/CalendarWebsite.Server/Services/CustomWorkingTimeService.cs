using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class CustomWorkingTimeService : ICustomWorkingTimeService
    {
        private readonly ICustomWorkingTimeRepository _customWorkingTimeRepository;

        public CustomWorkingTimeService(ICustomWorkingTimeRepository customWorkingTimeRepository)
        {
            _customWorkingTimeRepository = customWorkingTimeRepository;
        }

        public Task AddCustomWorkingTime(CustomWorkingTime customWorkingTime)
        {
             _customWorkingTimeRepository.AddAsync(customWorkingTime);
            return Task.CompletedTask;
        }

        public Task DeleteCustomWorkingTime(long id)
        {
            _customWorkingTimeRepository.DeleteAsyncByKey(id);
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<CustomWorkingTime>> GetAllCustomWorkingTimeByPersonalProfileId(long personalProfileId)
        {
            var result = await _customWorkingTimeRepository.FindList(
                predicate: each => each.PersonalProfileId == personalProfileId
            );
            return result;
        }
    }
}
