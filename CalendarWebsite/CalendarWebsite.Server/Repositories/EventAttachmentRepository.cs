using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Repositories
{
    public class EventAttachmentRepository : GenericRepository<EventAttachment>, IEventAttachmentRepository
    {
        public EventAttachmentRepository(UserDataContext context) : base(context)
        {
        }

        public async Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId)
        {
            return await _context.EventAttachments
                .Where(a => a.EventId == eventId)
                .ToListAsync();
        }
    }
}
