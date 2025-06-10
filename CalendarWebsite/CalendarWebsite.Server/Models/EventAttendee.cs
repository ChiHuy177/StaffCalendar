using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    [Table("EventAttendee", Schema = "dbo")]
    public class EventAttendee
    {
        public long Id {get; set;}

        [Required]
        [ForeignKey("CalendarEvent")]
        public long EventId {get; set;}

        [Required]
        [ForeignKey("PersonalProfile")]
        public long PersonalProfileId {get; set;}

        public bool ApprovalStatus {get; set;}

        public virtual PersonalProfile? PersonalProfile {get; set;}

        public virtual CalendarEvent? CalendarEvent {get; set;}

    }
}
