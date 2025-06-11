using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class FileService : IFileService
    {
        private readonly string _tempPath;
        private readonly string _uploadPath;
        private readonly IEventAttachmentService _attachmentService;

        public FileService(IWebHostEnvironment environment, IEventAttachmentService attachmentService)
        {
            _tempPath = Path.Combine(environment.ContentRootPath, "TempUpLoads");
            _uploadPath = Path.Combine(environment.ContentRootPath, "Uploads");
            _attachmentService = attachmentService;

            if (!Directory.Exists(_tempPath))
            {
                Directory.CreateDirectory(_tempPath);
            }
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task DeleteAttachment(long attachmentId)
        {
            var attachment = await _attachmentService.GetAttachment(attachmentId);
            if(attachment != null && System.IO.File.Exists(attachment.FilePath)){
                await Task.Run(() => System.IO.File.Delete(attachment.FilePath));
                await _attachmentService.DeleteAttachment(attachmentId);
            }
        }

        public async Task DeleteTempFile(string tempFileName)
        {
            var tempFilePath = Path.Combine(_tempPath, tempFileName);
            if(System.IO.File.Exists(tempFilePath)){
                await Task.Run(() => System.IO.File.Delete(tempFilePath));
            }
        }

        public async Task<EventAttachment> GetAttachment(long attachmentId)
        {
            return await _attachmentService.GetAttachment(attachmentId);
        }

        public async Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId)
        {
            return await _attachmentService.GetAttachmentsByEventId(eventId);
        }

        public async Task<EventAttachment> MoveTempToPermanent(long eventId, string tempFileName, string originalFileName, string fileType, long fileSize)
        {
            var tempFilePath = Path.Combine(_tempPath, tempFileName);
            if (!System.IO.File.Exists(tempFilePath)){
                throw new FileNotFoundException("Temp file not found");
            }

            var permanentFileName = $"{Guid.NewGuid()}_{originalFileName}";
            var permanentPath = Path.Combine(_uploadPath, permanentFileName);

            await Task.Run(() => System.IO.File.Move(tempFilePath, permanentPath));

            var attachment = new EventAttachment {
                EventId = eventId,
                FileName = originalFileName,
                FilePath = permanentPath,
                FileType = fileType,
                FileSize = fileSize
            };

            return await _attachmentService.AddAttachment(attachment);
        }

        public async Task<string> SaveTempFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file upload");
            }

            // Rút ngắn tên file nếu quá dài
            var originalName = file.FileName;
            var extension = Path.GetExtension(originalName);
            var shortName = originalName.Length > 50 
                ? $"{originalName.Substring(0, 50)}{extension}"
                : originalName;

            // Tạo tên file tạm ngắn hơn
            var tempFileName = $"{Guid.NewGuid().ToString("N")}_{shortName}";
            var tempFilePath = Path.Combine(_tempPath, tempFileName);

            using (var stream = new FileStream(tempFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return tempFileName;
        }
    }
}
