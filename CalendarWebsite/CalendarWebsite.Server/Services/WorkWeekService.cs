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
            return result ;
        }
    }
}
