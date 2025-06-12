using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileService _fileService;
        private readonly ILogger<FileController> _logger;

        public FileController(IFileService fileService, ILogger<FileController> logger)
        {
            _fileService = fileService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("No file was uploaded");
                    return BadRequest("No file was uploaded");
                }

                _logger.LogInformation($"Attempting to upload file: {file.FileName}");
                var fileId = await _fileService.SaveTempFile(file);
                _logger.LogInformation($"File uploaded successfully with ID: {fileId}");
                return Ok(new { fileId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file: {Message}", ex.Message);
                return BadRequest($"Error uploading file: {ex.Message}");
            }
        }

        [HttpGet("{fileId}")]
        public async Task<IActionResult> GetFile(string fileId, [FromQuery] bool download = false)
        {
            try
            {
                if (string.IsNullOrEmpty(fileId))
                {
                    _logger.LogWarning("File ID is null or empty");
                    return BadRequest("File ID is required");
                }

                _logger.LogInformation($"Attempting to retrieve file with ID: {fileId}");
                var file = await _fileService.GetFile(fileId);
                _logger.LogInformation($"File retrieved successfully: {file.FileName}");

                var fileBytes = Convert.FromBase64String(file.FileContent);
                
                if (download)
                {
                    return File(fileBytes, file.FileType, file.FileName);
                }
                else
                {
                    return File(fileBytes, file.FileType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving file: {Message}", ex.Message);
                return BadRequest($"Error retrieving file: {ex.Message}");
            }
        }
    }
}
