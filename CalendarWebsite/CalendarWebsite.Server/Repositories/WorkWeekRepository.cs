using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories
{
    public class WorkWeekRepository : GenericRepository<Workweek>, IWorkWeekRepository
    {
        public WorkWeekRepository(UserDataContext context) : base(context)
        {
        }
    }
}
