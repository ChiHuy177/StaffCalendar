namespace CalendarWebsite.Server.Models
{
    public class TempFileInfo
    {
        public string TempFileName { get; set; }
        public string OriginalFileName { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
    }
}