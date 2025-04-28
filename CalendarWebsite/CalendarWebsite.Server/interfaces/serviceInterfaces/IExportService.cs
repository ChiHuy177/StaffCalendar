using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces.serviceInterfaces
{
    public interface IExportService
    {
        Task<byte[]> ExportCheckInDataByMonthToExcelAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData);
        Task<byte[]> ExportUserCheckInDataToNPOIAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData);
        Task<byte[]> ExportUserCheckInDataByDateRange(int month, int year, int monthTo, int yearTo, IEnumerable<DataOnly_APIaCheckIn> checkinData);

    }
}
