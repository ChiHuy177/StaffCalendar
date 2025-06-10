using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    [Table("CalendarEvents", Schema = "dbo")]
    public class CalendarEvent
    {
        public long Id { get; set; }

        [Required]
        [StringLength(255)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string? EventType { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }


        [Required]
        public string? CreatedBy { get; set; }

        [Required]
        public DateTime CreatedTime { get; set; } = DateTime.Now;

        [Required]
        [StringLength(25)]
        public string RecurrentType { get; set; } = "Default";

        [Required]
        public bool IsDeleted { get; set; } = false;

        [Required]
        public long MeetingRoomId {get; set;}

        public virtual MeetingRoom? MeetingRoom {get; set;}


    }
}
