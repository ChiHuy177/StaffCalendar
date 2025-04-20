using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models;
    [Table("DataOnly_APIaCheckIn", Schema = "Dynamic")]
    public class DataOnly_APIaCheckIn
    {
        public long Id { get; set; }
        public long UserWorkflowId { get; set; }
        public string? UserId { get; set; }
        public decimal? Method { get; set; }
        public decimal? Check { get; set; }
        public decimal? EarlyIn { get; set; }
        public decimal? LateIn { get; set; }
        public decimal? EarlyOut { get; set; }
        public decimal? LateOut { get; set; }
        public DateTime? InAt { get; set; }
        public DateTime? OutAt { get; set; }
        public decimal? Wt { get; set; }
        public DateTime? At { get; set; }
        public string? FullName { get; set; }
        public string? Data { get; set; }
    }

