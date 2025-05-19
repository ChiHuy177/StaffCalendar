using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    public class CustomWorkingTimeDTO
    {
        public long Id { get; set; }
        public string? WorkweekTitle { get; set; }
        public long PersonalProfileId { get; set; }

        public string? FullName { get; set; } 

        public double? MorningStart { get; set; }
        public double? MorningEnd { get; set; }
        public double? AfternoonStart { get; set; }
        public double? AfternoonEnd { get; set; }

        public string? CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }

        public DateTime? LastModified { get; set; }
        public string? ModifiedBy { get; set; }

        public bool? IsDeleted { get; set; }

    }
}
