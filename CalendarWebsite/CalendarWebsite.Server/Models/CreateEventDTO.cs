namespace CalendarWebsite.Server.Models
{
    public class CreateEventDTO
    {
        public CalendarEvent Event { get; set; }
        public List<long> AttendeeIds { get; set; }
    }
}
