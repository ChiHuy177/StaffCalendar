using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces
{
    public interface IMeetingRoomService
    {
        public Task<IEnumerable<MeetingRoom>> GetAllMeetingRoom();
    }
}
