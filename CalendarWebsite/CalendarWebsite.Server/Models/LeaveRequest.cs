using System.ComponentModel.DataAnnotations.Schema;

namespace CalendarWebsite.Server.Models
{
    [Table("Data_HCQĐ07BM01", Schema = "Dynamic")]
    public class LeaveRequest
    {
        public long Id { get; set; }
        public long UserWorkflowId { get; set; }
        public string? NguoiDeNghi { get; set; }
        public string? BoPhan { get; set; }
        public DateTime? NgayVaoLam { get; set; }
        public string? LoaiPhepNam { get; set; }
        public string? KPI { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public decimal? TongSoNgayNghi { get; set; }
        public DateTime? NgayYeuCau { get; set; }
        public string? GhiChu { get; set; }
        public string? ChucVu { get; set; }
        public string? SignatureImageRequest { get; set; }
        public string? NghiPhep { get; set; }
    }
}
