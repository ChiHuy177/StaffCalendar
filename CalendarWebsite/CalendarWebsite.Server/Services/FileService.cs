using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;
using MongoDB.Driver;

namespace CalendarWebsite.Server.Services
{
    public class FileService : IFileService
    {
        private readonly MongoFileService _mongoFileService;
        private readonly ILogger<FileService> _logger;

        public FileService(MongoFileService mongoFileService, ILogger<FileService> logger)
        {
            _mongoFileService = mongoFileService;
            _logger = logger;
        }

        public async Task<string> SaveTempFile(IFormFile file)
        {
            try
            {
                _logger.LogInformation($"Saving temporary file: {file.FileName}");
                var fileId = await _mongoFileService.SaveFiles(file);
                _logger.LogInformation($"File saved successfully with ID: {fileId}");
                return fileId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error saving temporary file: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteTempFile(string tempFileName)
        {
            try
            {
                _logger.LogInformation($"Deleting temporary file: {tempFileName}");
                await _mongoFileService.DeleteFile(tempFileName);
                _logger.LogInformation($"Temporary file deleted successfully: {tempFileName}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting temporary file: {ex.Message}");
                throw;
            }
        }

        public async Task<EventAttachment> MoveTempToPermanent(long eventId, string tempFileName, string originalFileName, string fileType, long fileSize)
        {
            try
            {
                _logger.LogInformation($"Moving file {tempFileName} to permanent storage for event {eventId}");
                
                // Kiểm tra file tồn tại
                var file = await _mongoFileService.GetFile(tempFileName);
                if (file == null)
                {
                    _logger.LogWarning($"File with ID {tempFileName} not found in MongoDB");
                    throw new Exception($"File with ID {tempFileName} not found");
                }

                _logger.LogInformation($"Found file in MongoDB: {file.FileName}");

                // Cập nhật EventId trong MongoDB
                var filter = Builders<FileDocument>.Filter.Eq(x => x.Id, tempFileName);
                var update = Builders<FileDocument>.Update.Set(x => x.EventId, eventId.ToString());
                
                _logger.LogInformation($"Updating file with filter: {filter}");
                _logger.LogInformation($"Update operation: {update}");
                
                await _mongoFileService.UpdateFile(filter, update);

                var attachment = new EventAttachment
                {
                    EventId = eventId,
                    FileName = originalFileName,
                    FilePath = tempFileName,
                    FileType = fileType,
                    FileSize = fileSize
                };

                _logger.LogInformation($"File moved successfully to event {eventId}");
                return attachment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error moving file to permanent storage: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAttachment(long attachmentId)
        {
            try
            {
                _logger.LogInformation($"Deleting attachment: {attachmentId}");
                // TODO: Implement delete attachment logic
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting attachment: {ex.Message}");
                throw;
            }
        }

        public async Task<EventAttachment> GetAttachment(long attachmentId)
        {
            try
            {
                _logger.LogInformation($"Getting attachment: {attachmentId}");
                // TODO: Implement get attachment logic
                return new EventAttachment();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting attachment: {ex.Message}");
                throw;
            }
        }

        public async Task<List<EventAttachment>> GetAttachmentsByEventId(long eventId)
        {
            try
            {
                _logger.LogInformation($"Getting attachments for event: {eventId}");
                var files = await _mongoFileService.GetFilesByEventId(eventId.ToString());
                
                return files.Select(f => new EventAttachment
                {
                    EventId = eventId,
                    FileName = f.FileName,
                    FilePath = f.Id,
                    FileType = f.FileType,
                    FileSize = f.FileSize
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting attachments for event: {ex.Message}");
                throw;
            }
        }

        public async Task<FileDocument> GetFile(string fileId)
        {
            try
            {
                _logger.LogInformation($"Getting file with ID: {fileId}");
                var file = await _mongoFileService.GetFile(fileId);
                if (file == null)
                {
                    _logger.LogWarning($"File with ID {fileId} not found");
                    throw new Exception($"File with ID {fileId} not found");
                }
                _logger.LogInformation($"File retrieved successfully: {file.FileName}");
                return file;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting file: {ex.Message}");
                throw;
            }
        }
    }
} 