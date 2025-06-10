using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CalendarWebsite.Server.Services
{
    public class CalendarEventService : ICalendarEventService
    {
        private readonly ICalendarEventRepository _calendarEventRepository;
        private readonly IEventAttendeeRepository _eventAttendeeRepository;

        private readonly UserDataContext _context;
        public CalendarEventService(ICalendarEventRepository calendarEventRepository,
            IEventAttendeeRepository eventAttendeeRepository,
            UserDataContext userDataContext
            )
        {
            _calendarEventRepository = calendarEventRepository;
            _eventAttendeeRepository = eventAttendeeRepository;
            _context = userDataContext;
        }

        public async Task AddNewEvent(CalendarEvent calendarEvent)
        {
            try
            {
                await _calendarEventRepository.AddAsync(calendarEvent);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error when adding calendar event: {ex.Message}");
                throw;
            }
        }

        public async Task<CalendarEvent> CreateEventWithAttendees(CreateEventDTO createEventDTO)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate meeting room exists
                var meetingRoom = await _context.MeetingRooms.FindAsync(createEventDTO.Event.MeetingRoomId);
                if (meetingRoom == null)
                {
                    throw new Exception($"Phòng họp với ID {createEventDTO.Event.MeetingRoomId} không tồn tại");
                }

                // Validate attendees exist
                foreach (var attendeeId in createEventDTO.AttendeeIds)
                {
                    var attendee = await _context.PersonalProfiles.FindAsync(attendeeId);
                    if (attendee == null)
                    {
                        throw new Exception($"Người dùng với ID {attendeeId} không tồn tại");
                    }
                }

                //create event
                var newEvent = await _calendarEventRepository.AddAsync(createEventDTO.Event);

                //create event attendees
                var eventAttendees = createEventDTO.AttendeeIds.Select(attendeeId => new EventAttendee
                {
                    EventId = newEvent.Id,
                    PersonalProfileId = attendeeId,
                    ApprovalStatus = false
                }).ToList();

                foreach(EventAttendee eventAttendee in eventAttendees) {
                    await _eventAttendeeRepository.AddAsync(eventAttendee);
                }
                
                //commit transaction
                await transaction.CommitAsync();
                return newEvent;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Lỗi khi tạo sự kiện: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public Task DeleteEvent(long id)
        {
            _calendarEventRepository.DeleteAsyncByKey(id);
            return Task.CompletedTask;
        }

        public Task<List<CalendarEvent>> GetAllEventByUserId(long userId)
        {
            // var result = _calendarEventRepository.FindList(
            //     predicate: each => each.CreatedBy == userId
            // );
            return null;
        }

        public Task<List<CalendarEvent>> GetAllMeetingEvents()
        {   
            var result = _calendarEventRepository.FindList(
                predicate: each => each.EventType == "Meeting"
            );
            return result;
        }

        public Task UpdateEvent(CalendarEvent calendarEvent)
        {
            throw new NotImplementedException();
        }
    }
}
