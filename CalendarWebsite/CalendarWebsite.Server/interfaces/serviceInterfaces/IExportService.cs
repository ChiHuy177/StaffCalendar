using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces.serviceInterfaces
{
    public interface IExportService
    {
        Task<byte[]> ExportUserCheckInDataToExcelAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData);
        Task<byte[]> ExportCheckInDataByDayToExcelAsync(int day, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData);
        Task<byte[]> ExportUserCheckInDataToNPOIAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData);
    }
}
