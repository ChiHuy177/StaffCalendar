using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class EventAttendeeService : IEventAttendeeService
    {
        private readonly IEventAttendeeRepository _eventAttendeeRepository;

        public EventAttendeeService(IEventAttendeeRepository eventAttendeeRepository){
            _eventAttendeeRepository = eventAttendeeRepository;
        }
        public async Task AddNewAttendee(EventAttendee eventAttendee)
        {
            try {
                await _eventAttendeeRepository.AddAsync(eventAttendee);

            } catch (Exception ex){
                Console.WriteLine($"Error when adding new attendee: {ex.Message}");
                if(ex.InnerException != null){
                    Console.WriteLine($"Inner Exception when adding new attendee: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public Task DeleteAttendee(long id)
        {
             _eventAttendeeRepository.DeleteAsyncByKey(id);
             return Task.CompletedTask;
        }

        public Task SetApprovalStatus(long id, bool isApprove)
        {
            throw new NotImplementedException();
        }
    }
}
