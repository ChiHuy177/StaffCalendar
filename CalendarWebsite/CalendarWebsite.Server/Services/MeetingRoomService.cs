using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class MeetingRoomService : IMeetingRoomService
    {
        private readonly IMeetingRoomRepository _meetingRoomRepository;
        private readonly ICalendarEventRepository _calendarEventRepository;

        public MeetingRoomService(IMeetingRoomRepository meetingRoomRepository,
            ICalendarEventRepository calendarEventRepository)
        {
            _meetingRoomRepository = meetingRoomRepository;
            _calendarEventRepository = calendarEventRepository;
        }

        public async Task<IEnumerable<MeetingRoom>> GetAllMeetingRoom()
        {
            var result = await _meetingRoomRepository.GetAllAsync();
            return result;
        }

        public async Task<List<CalendarEvent>> GetRoomsBookings(long roomId, DateTime startTime, DateTime endTime)
        {
            return await _calendarEventRepository.FindList(
                predicate: e => e.MeetingRoomId == roomId
                    && !e.IsDeleted 
                    && ((e.StartTime <= startTime && e.EndTime > startTime)
                        || (e.StartTime < endTime && e.EndTime >= endTime)
                        || (e.StartTime >= startTime && e.EndTime <= endTime)
                    )
            );
        }

        public async Task<bool> IsRoomAvailable(long roomId, DateTime startTime, DateTime endTime)
        {
            var existingEvents = await GetRoomsBookings(roomId, startTime, endTime);
            return !existingEvents.Any();
        }
    }
}
