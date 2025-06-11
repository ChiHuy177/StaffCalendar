using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class EventAttachmentService : IEventAttachmentService
    {

        private readonly IEventAttachmentRepository _attachmentRepository;

        public EventAttachmentService(IEventAttachmentRepository attachmentRepository){
            _attachmentRepository = attachmentRepository;
        }

        public async Task<EventAttachment> AddAttachment(EventAttachment attachment)
        {
            await _attachmentRepository.AddAsync(attachment);
            return attachment;
        }

        public async Task DeleteAttachment(long id)
        {
            await _attachmentRepository.DeleteAsyncByKey(id);
        }

        public async Task<EventAttachment> GetAttachment(long id)
        {
            return await _attachmentRepository.GetByIdAsync(id);
        }

        public async Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId)
        {
            return await _attachmentRepository.GetAttachmentsByEventId(eventId);
        }
    }
}
