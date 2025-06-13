using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces
{
    public interface IMeetingRoomService
    {
        public Task<IEnumerable<MeetingRoom>> GetAllMeetingRoom();
        public Task<bool> IsRoomAvailable(long roomId, DateTime startTime, DateTime endTime);
        public Task<List<CalendarEvent>> GetRoomsBookings(long roomId, DateTime startTime, DateTime endTime);
    }
}
