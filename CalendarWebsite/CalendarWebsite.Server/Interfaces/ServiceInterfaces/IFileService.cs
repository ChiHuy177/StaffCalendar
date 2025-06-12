using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface IFileService
    {
        public Task<string> SaveTempFile(IFormFile file);
        public Task DeleteTempFile(string tempFileName);
        Task<EventAttachment> MoveTempToPermanent(long eventId, string tempFileName, string originalFileName, string fileType, long fileSize);
        Task DeleteAttachment(long attachmentId);
        Task<EventAttachment> GetAttachment(long attachmentId);
        Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId);
        Task<FileDocument> GetFile(string fileId);
    }
}
