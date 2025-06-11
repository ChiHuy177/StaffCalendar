using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    public class EventAttachment
    {
        public long Id { get; set; }

        [Required]
        [ForeignKey("CalendarEvent")]
        public long EventId { get; set; }

        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public string? FileType { get; set; }
        public long FileSize { get; set; }

        public virtual CalendarEvent? CalendarEvent { get; set; }
    }
}
