using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class MeetingRoomService : IMeetingRoomService
    {
        private readonly IMeetingRoomRepository _meetingRoomRepository;

        public MeetingRoomService(IMeetingRoomRepository meetingRoomRepository){
            _meetingRoomRepository = meetingRoomRepository;
        }

        public async Task<IEnumerable<MeetingRoom>> GetAllMeetingRoom()
        {
            var result = await _meetingRoomRepository.GetAllAsync();
            return result;
        }
    }
}
