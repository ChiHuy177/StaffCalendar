using CalendarWebsite.Server.Models;
using MongoDB.Driver;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using UglyToad.PdfPig;
namespace CalendarWebsite.Server.Services
{
    public class MongoFileService
    {
        private readonly IMongoCollection<FileDocument> _files;
        private readonly ILogger<MongoFileService> _logger;
        private readonly long _maxFileSize = 16 * 1024 * 1024; //16mb
        private readonly long _maxBase64Sile = 5 * 1024 * 1024; //5mb

        public MongoFileService(IConfiguration configuration, ILogger<MongoFileService> logger)
        {
            _logger = logger;
            var connectionString = configuration["MongoDB:ConnectionString"];
            var databaseName = configuration["MongoDB:DatabaseName"];

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            _files = database.GetCollection<FileDocument>("files");
        }

        public async Task<string> SaveFiles(IFormFile file)
        {
            try
            {
                if (file.Length > _maxFileSize)
                {
                    throw new Exception($"File size exceeds MongoBD limit of {_maxFileSize / 1024 / 1024}MB");
                }
                using var stream = file.OpenReadStream();
                using var memoryStream = new MemoryStream();
                await stream.CopyToAsync(memoryStream);
                byte[] fileBytes = memoryStream.ToArray();

                if (file.ContentType.StartsWith("image/"))
                {
                    return await HandleImageFile(file, fileBytes);
                } else if (file.ContentType == "application/pdf") {
                    return await HandlePdfFile(file, fileBytes);
                } else {
                    return await HandleOtherFiles(file, fileBytes);
                }


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file to MongoDB: {Message}", ex.Message);
                throw;
            }
        }

        private async Task<string> HandleImageFile(IFormFile file, byte[] fileBytes)
        {
            using var image = Image.Load(fileBytes);

            using var thumbnailStream = new MemoryStream();
            await image.SaveAsJpegAsync(thumbnailStream);
            string thumbnailBase64 = Convert.ToBase64String(thumbnailStream.ToArray());

            string fileBase64;
            if (fileBytes.Length > _maxBase64Sile)
            {
                using var compressedStream = new MemoryStream();
                await image.SaveAsJpegAsync(compressedStream, new JpegEncoder { Quality = 75 });
                fileBase64 = Convert.ToBase64String(compressedStream.ToArray());
            }
            else
            {
                fileBase64 = Convert.ToBase64String(fileBytes);
            }

            var fileDocument = new FileDocument
            {
                FileName = file.FileName,
                FileType = file.ContentType,
                FileSize = fileBytes.Length,
                FileContent = fileBase64,
                ThumbnailContent = thumbnailBase64,
                UploadDate = DateTime.UtcNow,
                IsCompressed = fileBytes.Length > _maxBase64Sile,
                EventId = null // Explicitly set to null
            };

            await _files.InsertOneAsync(fileDocument);
            return fileDocument.Id;
        }

        private async Task<string> HandlePdfFile(IFormFile file, byte[] fileBytes)
        {
            string fileBase64 = Convert.ToBase64String(fileBytes);
            string thumbnailBase64 = GeneratePdfThumbnail(fileBytes);

            var fileDocument = new FileDocument
            {
                FileName = file.FileName,
                FileType = file.ContentType,
                FileSize = fileBytes.Length,
                FileContent = fileBase64,
                ThumbnailContent = thumbnailBase64,
                UploadDate = DateTime.UtcNow,
                IsCompressed = false,
                EventId = null // Explicitly set to null
            };

            await _files.InsertOneAsync(fileDocument);
            return fileDocument.Id;
        }

        private async Task<string> HandleOtherFiles(IFormFile file, byte[] fileBytes)
        {
            string fileBase64 = Convert.ToBase64String(fileBytes);
            var fileDocument = new FileDocument
            {
                FileName = file.FileName,
                FileType = file.ContentType,
                FileSize = fileBytes.Length,
                FileContent = fileBase64,
                UploadDate = DateTime.UtcNow,
                IsCompressed = false,
                EventId = null // Explicitly set to null
            };

            await _files.InsertOneAsync(fileDocument);
            return fileDocument.Id;
        }

        public async Task<FileDocument> GetFile(string fileId, bool getThumbnail = false){
            try {
                var file = await _files.Find(f => f.Id == fileId).FirstOrDefaultAsync();
                if (file == null){
                    throw new Exception($"File with ID {fileId} not found");
                }

                if( getThumbnail && !string.IsNullOrEmpty(file.ThumbnailContent)){
                    file.FileContent = file.ThumbnailContent;
                }

                return file;
            } catch (Exception ex) {
                _logger.LogError(ex, $"Error retrieving file from MongoDB: {ex.Message}");
                throw;
            }
        }

        private string GeneratePdfThumbnail(byte[] pdfBytes)
        {
            using var document = PdfDocument.Open(pdfBytes);
            var firstPage = document.GetPage(1);
            // Tạm thời trả về base64 của trang đầu tiên
            return Convert.ToBase64String(pdfBytes);
        }

        public async Task UpdateFile(FilterDefinition<FileDocument> filter, UpdateDefinition<FileDocument> update)
        {
            try
            {
                _logger.LogInformation("Attempting to update file in MongoDB");
                
                // Log the filter and update for debugging
                _logger.LogInformation($"Filter: {filter}");
                _logger.LogInformation($"Update: {update}");

                var result = await _files.UpdateOneAsync(filter, update);
                
                if (result.MatchedCount == 0)
                {
                    _logger.LogWarning("No file found matching the filter");
                    throw new Exception("No file found to update");
                }
                
                _logger.LogInformation($"File updated successfully. Modified count: {result.ModifiedCount}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating file in MongoDB: {Message}", ex.Message);
                throw;
            }
        }

        public async Task DeleteFile(string fileId)
        {
            try
            {
                var result = await _files.DeleteOneAsync(f => f.Id == fileId);
                if (result.DeletedCount == 0)
                {
                    throw new Exception($"No file found with ID {fileId}");
                }
                _logger.LogInformation($"File deleted successfully. Deleted count: {result.DeletedCount}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file from MongoDB: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<List<FileDocument>> GetFilesByEventId(string eventId)
        {
            try
            {
                var files = await _files.Find(f => f.EventId == eventId).ToListAsync();
                return files;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting files by event ID from MongoDB: {Message}", ex.Message);
                throw;
            }
        }
    }
}
