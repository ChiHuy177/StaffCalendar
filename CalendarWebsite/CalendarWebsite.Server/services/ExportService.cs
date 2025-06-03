using CalendarWebsite.Server.interfaces.serviceInterfaces;
using CalendarWebsite.Server.Models;
using ClosedXML.Excel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;

namespace CalendarWebsite.Server.services
{
    public class ExportService : IExportService
    {
        public async Task<byte[]> ExportCheckInDataByMonthToExcelAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData)
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
            return await Task.FromResult(stream.ToArray());
        }

        public async Task<byte[]> ExportUserCheckInDataByDateRange(int day, int month, int year, int dayTo, int monthTo, int yearTo, IEnumerable<DataOnly_APIaCheckIn> checkinData)
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
            sheet.Cell("A4").Value = $"Thời gian: từ {day}/{month}/{year} đến {dayTo}/{monthTo}/{yearTo}";

            // Table headers
            sheet.Cell(6, 1).Value = "No";
            sheet.Cell(6, 2).Value = "Full Name";
            sheet.Cell(6, 3).Value = "Check-in day";
            sheet.Cell(6, 4).Value = "Check-in Time";
            sheet.Cell(6, 5).Value = "Check-out Time";
            sheet.Cell(6, 6).Value = "Total working time";
            sheet.Range("A6:F6").Style.Font.Bold = true;

            // Add data rows
            var checkinList = checkinData.ToList();
            for (int i = 0; i < checkinList.Count; i++)
            {
                var data = checkinList[i];
                DateTime? checkinTime = data.InAt?.AddHours(7);
                DateTime? checkoutTime = data.OutAt?.AddHours(7);
                string checkinDay = checkinTime.HasValue ? checkinTime.Value.ToString("dd/MM/yyyy") : "N/A";
                string checkinTimeFormatted = checkinTime.HasValue ? checkinTime.Value.ToString("HH:mm") : "N/A";
                string checkoutTimeFormatted = checkoutTime.HasValue ? checkoutTime.Value.ToString("HH:mm") : "N/A";
                string totalTime = checkinTime.HasValue && checkoutTime.HasValue
                    ? (checkoutTime.Value - checkinTime.Value - TimeSpan.FromHours(1)).ToString(@"hh\:mm")
                    : "N/A";

                sheet.Cell(i + 7, 1).Value = i + 1;
                sheet.Cell(i + 7, 2).Value = data.FullName ?? "N/A";
                sheet.Cell(i + 7, 3).Value = checkinDay;
                sheet.Cell(i + 7, 4).Value = checkinTimeFormatted;
                sheet.Cell(i + 7, 5).Value = checkoutTimeFormatted;
                sheet.Cell(i + 7, 6).Value = totalTime;
            }
            sheet.Columns(1, 6).AdjustToContents();
            using var stream = new MemoryStream();
            wb.SaveAs(stream);
            return await Task.FromResult(stream.ToArray());
        }

        public async Task<byte[]> ExportUserCheckInDataToNPOIAsync(string userId, int month, int year, IEnumerable<DataOnly_APIaCheckIn> checkinData)
        {
            // Tạo workbook và sheet
            var workbook = new XSSFWorkbook();
            var sheet = workbook.CreateSheet("Checkin Data");

            //lấy file ảnh
            // string imagePath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot","imgs","becamex.png");
            // byte[] bytes = System.IO.File.ReadAllBytes(imagePath);

            // int pictureIdx = workbook.AddPicture(bytes, PictureType.PNG);

            // var drawing = sheet.CreateDrawingPatriarch();

            var anchor = new XSSFClientAnchor
            {
                Col1 = 0,
                Row1 = 0,
                Col2 = 5,
                Row2 = 1
            };

            // var picture = drawing.CreatePicture(anchor, pictureIdx);
            // picture.Resize();

            // Đặt độ rộng cột
            for (int i = 0; i < 6; i++)
            {
                sheet.SetColumnWidth(i, 20 * 256);
            }

            // Font in đậm
            var boldFont = workbook.CreateFont();
            boldFont.IsBold = true;

            // Style căn giữa thường
            var centerStyle = workbook.CreateCellStyle();
            centerStyle.Alignment = HorizontalAlignment.Center;

            // Style căn giữa + in đậm
            var boldCenterStyle = workbook.CreateCellStyle();
            boldCenterStyle.Alignment = HorizontalAlignment.Center;
            boldCenterStyle.SetFont(boldFont);

            // Logo - dòng 0
            var row0 = sheet.CreateRow(0);
            row0.HeightInPoints = 25;
            var cell0 = row0.CreateCell(0);
            cell0.SetCellValue("VNTT");
            cell0.CellStyle = boldCenterStyle;
            sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(0, 0, 0, 5));

            // Tiêu đề - dòng 1
            var row1 = sheet.CreateRow(1);
            var cell1 = row1.CreateCell(0);
            cell1.SetCellValue("BÁO CÁO CHECK IN AND CHECK OUT");
            cell1.CellStyle = boldCenterStyle;
            sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(1, 1, 0, 5));

            // Nhân viên - dòng 2
            var row2 = sheet.CreateRow(2);
            var fullName = checkinData.FirstOrDefault()?.FullName ?? "";
            var cell2 = row2.CreateCell(0);
            // cell2.SetCellValue($"Nhân viên: {userID} - {fullName}");
            cell2.CellStyle = boldCenterStyle;
            sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(2, 2, 0, 5));

            // Thời gian - dòng 3
            var row3 = sheet.CreateRow(3);
            var cell3 = row3.CreateCell(0);
            cell3.SetCellValue($"Thời gian: Tháng {month}/{year}");
            cell3.CellStyle = boldCenterStyle;
            sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(3, 3, 0, 5));

            // Header - dòng 5
            var headerRow = sheet.CreateRow(5);
            string[] headers = { "No", "Working Day", "Check-in Time", "Check-out Time", "Total working time" };
            for (int i = 0; i < headers.Length; i++)
            {
                var headerCell = headerRow.CreateCell(i);
                headerCell.SetCellValue(headers[i]);
                headerCell.CellStyle = boldCenterStyle;
            }
            var checkinList = checkinData.ToList();
            // Dữ liệu từ dòng 6
            for (int i = 0; i < checkinList.Count; i++)
            {
                var row = sheet.CreateRow(i + 6);

                DateTime checkin = checkinList[i].InAt?.AddHours(7) ?? DateTime.MinValue;
                DateTime checkout = checkinList[i].OutAt?.AddHours(7) ?? DateTime.MinValue;
                TimeSpan total = checkout - checkin - TimeSpan.FromHours(1);

                var cellIndex = 0;

                var cellNo = row.CreateCell(cellIndex++);
                cellNo.SetCellValue(i + 1);
                cellNo.CellStyle = centerStyle;

                var cellDate = row.CreateCell(cellIndex++);
                cellDate.SetCellValue(checkinList[i].InAt?.ToString("dd/MM/yyyy") ?? "N/A");
                cellDate.CellStyle = centerStyle;

                var cellCheckin = row.CreateCell(cellIndex++);
                cellCheckin.SetCellValue(checkin != DateTime.MinValue ? checkin.ToShortTimeString() : "N/A");
                cellCheckin.CellStyle = centerStyle;

                var cellCheckout = row.CreateCell(cellIndex++);
                cellCheckout.SetCellValue(checkout != DateTime.MinValue ? checkout.ToShortTimeString() : "N/A");
                cellCheckout.CellStyle = centerStyle;

                var cellTotal = row.CreateCell(cellIndex++);
                cellTotal.SetCellValue(checkin != DateTime.MinValue && checkout != DateTime.MinValue
                    ? total.ToString(@"hh\:mm") : "N/A");
                cellTotal.CellStyle = centerStyle;
            }
            using var ms = new MemoryStream();
            workbook.Write(ms);
            var content = ms.ToArray();
            return await Task.FromResult(content.ToArray());
        }
    }
}
