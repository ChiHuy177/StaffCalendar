using CalendarWebsite.Server.interfaces.serviceInterfaces;
using CalendarWebsite.Server.Models;
using ClosedXML.Excel;

namespace CalendarWebsite.Server.services
{
    public class ExportService : IExportService
    {
        public Task<byte[]> ExportCheckInDataByDayToExcelAsync(int day, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData)
        {
            using var wb = new XLWorkbook();
            var sheet = wb.AddWorksheet("Checkin Data By Day");

            // Set column width and alignment
            sheet.Columns(1, 5).Width = 20;
            sheet.Columns(1, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            sheet.Columns(1, 5).AdjustToContents();

            // Add header
            sheet.Range("A1:E1").Merge();
            sheet.Cell("A1").Value = "VNTT";
            sheet.Cell("A1").Style.Font.Bold = true;
            sheet.Cell("A1").Style.Font.FontSize = 16;

            sheet.Range("A2:E2").Merge();
            sheet.Cell("A2").Value = "BÁO CÁO CHECK IN AND CHECK OUT";
            sheet.Cell("A2").Style.Font.Bold = true;
            sheet.Cell("A2").Style.Font.FontSize = 14;

            sheet.Range("A4:E4").Merge();
            sheet.Cell("A4").Value = $"Thời gian: Ngày {day} tháng {month} năm {year}";

            // Table headers
            sheet.Cell(6, 1).Value = "No";
            sheet.Cell(6, 2).Value = "Full Name";
            sheet.Cell(6, 3).Value = "Check-in Time";
            sheet.Cell(6, 4).Value = "Check-out Time";
            sheet.Cell(6, 5).Value = "Total working time";
            sheet.Range("A6:E6").Style.Font.Bold = true;

            // Add data rows
            var checkinList = checkinData.ToList();
            for (int i = 0; i < checkinList.Count; i++)
            {
                var data = checkinList[i];
                DateTime? checkinTime = data.InAt?.AddHours(7);
                DateTime? checkoutTime = data.OutAt?.AddHours(7);
                string checkinTimeFormatted = checkinTime.HasValue ? checkinTime.Value.ToString("HH:mm") : "N/A";
                string checkoutTimeFormatted = checkoutTime.HasValue ? checkoutTime.Value.ToString("HH:mm") : "N/A";
                string totalTime = checkinTime.HasValue && checkoutTime.HasValue
                    ? (checkoutTime.Value - checkinTime.Value - TimeSpan.FromHours(1)).ToString(@"hh\:mm")
                    : "N/A";

                sheet.Cell(i + 7, 1).Value = i + 1;
                sheet.Cell(i + 7, 2).Value = data.FullName ?? "N/A";
                sheet.Cell(i + 7, 3).Value = checkinTimeFormatted;
                sheet.Cell(i + 7, 4).Value = checkoutTimeFormatted;
                sheet.Cell(i + 7, 5).Value = totalTime;
            }

            using var stream = new MemoryStream();
            wb.SaveAs(stream);
            return Task.FromResult(stream.ToArray());
        }

        public Task<byte[]> ExportUserCheckInDataToExcelAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData)
        {
            using var wb = new XLWorkbook();
            var sheet = wb.AddWorksheet("Checkin Data");

            // Set column width
            sheet.Columns().Width = 20;
            sheet.Columns().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            // Add Header
            sheet.Range("A1:F1").Merge();
            sheet.Cell("A1").Value = "VNTT";
            sheet.Cell("A1").Style.Font.Bold = true;
            sheet.Cell("A1").Style.Font.FontSize = 16;

            sheet.Range("A2:F2").Merge();
            sheet.Cell("A2").Value = "BÁO CÁO CHECK IN AND CHECK OUT";
            sheet.Cell("A2").Style.Font.Bold = true;
            sheet.Cell("A2").Style.Font.FontSize = 14;

            sheet.Range("A3:F3").Merge();
            sheet.Cell("A3").Value = $"Nhân viên: {userId} - {checkinData.FirstOrDefault()?.FullName ?? "Unknown"}";
            sheet.Cell("A3").Style.Font.Italic = true;

            sheet.Range("A4:F4").Merge();
            sheet.Cell("A4").Value = $"Thời gian: Tháng {month}/{year}";

            // Headers
            sheet.Cell(6, 1).Value = "No";
            sheet.Cell(6, 2).Value = "Working Day";
            sheet.Cell(6, 3).Value = "Check-in Time";
            sheet.Cell(6, 4).Value = "Check-out Time";
            sheet.Cell(6, 5).Value = "Total working time";

            var checkinList = checkinData.ToList();

            // Add data rows
            for (int i = 0; i < checkinList.Count; i++)
            {
                DateTime checkinTime = checkinList[i].InAt?.AddHours(7) ?? DateTime.MinValue;
                string checkinTimeFormatted = checkinTime != DateTime.MinValue ? checkinTime.ToShortTimeString() : "N/A";

                DateTime checkoutTime = checkinList[i].OutAt?.AddHours(7) ?? DateTime.MinValue;
                string checkoutTimeFormatted = checkoutTime != DateTime.MinValue ? checkoutTime.ToShortTimeString() : "N/A";

                TimeSpan timeDifference = checkoutTime != DateTime.MinValue && checkinTime != DateTime.MinValue
                    ? checkoutTime - checkinTime - TimeSpan.FromHours(1)
                    : TimeSpan.Zero;

                sheet.Cell(i + 7, 1).Value = i + 1;
                sheet.Cell(i + 7, 2).Value = checkinList[i].InAt?.ToString("dd/MM/yyyy") ?? "N/A";
                sheet.Cell(i + 7, 3).Value = checkinTimeFormatted;
                sheet.Cell(i + 7, 4).Value = checkoutTimeFormatted;
                sheet.Cell(i + 7, 5).Value = timeDifference != TimeSpan.Zero ? timeDifference.ToString(@"hh\:mm") : "N/A";
            }

            using var stream = new MemoryStream();
            wb.SaveAs(stream);
            return Task.FromResult(stream.ToArray());
        }

        public Task<byte[]> ExportUserCheckInDataToNPOIAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData)
        {
            throw new NotImplementedException();
        }
    }
}
