
using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    [Table("MeetingRoom", Schema = "dbo")]
    public class MeetingRoom
    {
        public long? Id { get; set; }
        public string? RoomName { get; set; }   
    }
}