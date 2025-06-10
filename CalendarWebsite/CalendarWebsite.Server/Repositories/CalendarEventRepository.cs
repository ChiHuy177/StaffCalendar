using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories
{
    public class CalendarEventRepository : GenericRepository<CalendarEvent>, ICalendarEventRepository
    {
        public CalendarEventRepository(UserDataContext context) : base(context)
        {
        }
    }
}
