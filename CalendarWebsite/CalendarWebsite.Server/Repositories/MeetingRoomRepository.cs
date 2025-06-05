using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories
{
    public class MeetingRoomRepository : GenericRepository<MeetingRoom>, IMeetingRoomRepository
    {
        public MeetingRoomRepository(UserDataContext context) : base(context)
        {
        }
    }
}
