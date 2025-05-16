using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;

namespace CalendarWebsite.Server.Services
{
    public class WorkWeekService : IWorkingWeekService
    {

        private readonly IWorkWeekRepository _workWeekRepository;
        public WorkWeekService(IWorkWeekRepository workWeekRepository)
        {
            _workWeekRepository = workWeekRepository;
        }
        public Task<long> GetWorkweekIdByTitle(string title)
        {
            var result = _workWeekRepository.FindOneSelect(
                x => x.Title == title,
                x => x.Id,
                orderBy: null
            );
            return result;
        }
        
        public async Task<string> GetWorkweekTitleById(long id)
        {
            var result = await _workWeekRepository.FindOneSelect(
                predicate: x => x.Id == id,
                selector: x => x.Title,
                orderBy: null
            );
            Console.WriteLine(result);
            return result ?? string.Empty;
        }
    }
}
