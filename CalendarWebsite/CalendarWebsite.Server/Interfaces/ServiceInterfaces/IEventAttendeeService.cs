using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface IEventAttendeeService
    {
        public Task AddNewAttendee(EventAttendee eventAttendee);

        public Task DeleteAttendee(long id);

        public Task SetApprovalStatus(long id, bool isApprove);
    }
}
