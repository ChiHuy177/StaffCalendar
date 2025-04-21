using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    [Table("Department", Schema = "dbo")]
    public class Department
    {

        public long Id { get; set; }
        public string? Title { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public long? ParentId { get; set; }
        public string? ChartCode { get; set; }
        public long? ManagerId { get; set; }
        public int? DeptLevel { get; set; }
        public string? Email { get; set; }
        public string? Telephone { get; set; }
        public string? Fax { get; set; }
        public string? Address { get; set; }
        public string? SiteName { get; set; }
        public int? Order { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public DateTime? LastModified { get; set; }
        public string? ModifiedBy { get; set; }
        public bool? IsDeleted { get; set; }
        public string? TitleEN { get; set; }
        public bool? IsHSSE { get; set; }
        public int? HSSEOrder { get; set; }
        public string? HOD { get; set; }
    }
}
