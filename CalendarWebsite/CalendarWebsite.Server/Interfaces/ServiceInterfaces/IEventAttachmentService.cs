using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface IEventAttachmentService
    {
        public Task<EventAttachment> AddAttachment(EventAttachment attachment);
        public Task DeleteAttachment(long id);
        public Task<EventAttachment> GetAttachment(long id);

        public Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId);

    }

}