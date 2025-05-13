namespace CalendarWebsite.Server.Models
{
    public class CheckinDataDTO
    {
        public long Id { get; set; }
        public string? UserId { get; set; }
        public DateTime? InAt { get; set; }
        public DateTime? OutAt { get; set; }
        public DateTime? Date { get; set; }
        public string? FullName { get; set; }
        public string? LoaiPhepNam { get; set; }
        public string? Attendant { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public decimal? TongSoNgayNghi { get; set; }
        public DateTime? NgayYeuCau { get; set; }
        public string? GhiChu { get; set; }
    }
}
