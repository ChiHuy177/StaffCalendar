using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories
{
    public class EventAttendeeRepository : GenericRepository<EventAttendee>, IEventAttendeeRepository
    {
        public EventAttendeeRepository(UserDataContext context) : base(context)
        {
        }
    }
}
