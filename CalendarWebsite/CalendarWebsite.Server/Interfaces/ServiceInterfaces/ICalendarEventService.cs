using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface ICalendarEventService
    {
        public Task<List<CalendarEvent>> GetAllEventByUserId(long userId);

        public Task<List<CalendarEvent>> GetAllMeetingEvents();

        public Task UpdateEvent(CalendarEvent calendarEvent);

        public Task AddNewEvent(CalendarEvent calendarEvent);

        public Task DeleteEvent(long id);

        public Task<CalendarEvent> CreateEventWithAttendees(CreateEventDTO createEventDTO);

        public Task<List<CalendarEvent>> GetEventsByRange(DateTime start, DateTime end);
    }
}
