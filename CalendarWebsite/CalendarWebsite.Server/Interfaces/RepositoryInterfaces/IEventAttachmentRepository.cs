using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.RepositoryInterfaces
{
    public interface IEventAttachmentRepository: IGenericRepository<EventAttachment>
    {
        Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId);
    }
}
