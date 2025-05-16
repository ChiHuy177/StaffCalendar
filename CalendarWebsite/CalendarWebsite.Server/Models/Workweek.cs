using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    [Table("WorkWeek", Schema = "dbo")]
    public class Workweek
    {
        public long Id { get; set; }
        public string? Title { get; set; }
        public bool IsFullTime { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        public DateTime? LastModified { get; set; }
        public string? ModifiedBy { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
