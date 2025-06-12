using MongoDB.Bson.Serialization.Attributes;

namespace CalendarWebsite.Server.Models
{
    public class FileDocument
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]

        public string Id { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public string FileContent { get; set; }
        public string ThumbnailContent { get; set; }
        public DateTime UploadDate { get; set; }
        public string EventId { get; set; }
        public bool IsCompressed { get; set; }

    }
}
