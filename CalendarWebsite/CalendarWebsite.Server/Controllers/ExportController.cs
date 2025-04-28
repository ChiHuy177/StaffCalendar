using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;


namespace CalendarWebsite.Server.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class ExportController : ControllerBase

    {
        private readonly UserDataContext _context;
        private readonly IExportService _exportService;
        private readonly ICheckInDataService _checkinDataService;
        public ExportController(UserDataContext context, IExportService exportService, ICheckInDataService checkinDataService)
        {
            _context = context;
            _exportService = exportService;
            _checkinDataService = checkinDataService;
        }

        [HttpGet("ExportUserCheckinData")]
        public async Task<IActionResult> ExportUserCheckinData(int month, int year, string userID)
        {
            var checkinData = await _checkinDataService.GetUserByUserId(month, year, userID);
            if (checkinData == null || checkinData.Count() == 0)
            {
                return NotFound("No check-in data found for the specified user and period.");
            }

            var excelData = await _exportService.ExportCheckInDataByMonthToExcelAsync(userID, month, year, checkinData);
            return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"checkin-data-{userID}-{month}-{year}.xlsx");
        }

        [HttpGet("ExportDataByDateRange")]
        public async Task<IActionResult> ExportDataByDateRange(int day, int month, int year, int dayTo, int monthTo, int yearTo){
            var checkinData = await _checkinDataService.GetAllCheckinInDayRange(day, month, year, dayTo, monthTo, yearTo);
            if (checkinData == null || checkinData.Count() == 0) {
                return NotFound("No check-in data found for the specified period.");
            }
            
            var excelData = await _exportService.ExportUserCheckInDataByDateRange(month, year, monthTo, yearTo, checkinData);
            return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"checkin-data-{month}-{year}-to-{monthTo}-{yearTo}.xlsx");
        }

      
        [HttpGet("ExportUserCheckinDataNPOI")]
        public async Task<IActionResult> ExportUserCheckinDataNPOI(int month, int year, string userID)
        {
            var checkinData = await _context.Users
                .Where(w => w.UserId == userID && w.InAt.HasValue && w.InAt.Value.Month == month && w.InAt.Value.Year == year)
                .OrderBy(w => w.InAt)
                .ToListAsync();
            // Tạo workbook và sheet
            var workbook = new XSSFWorkbook();
            var sheet = workbook.CreateSheet("Checkin Data");

            //lấy file ảnh
            // string imagePath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot","imgs","becamex.png");
            // byte[] bytes = System.IO.File.ReadAllBytes(imagePath);

            // int pictureIdx = workbook.AddPicture(bytes, PictureType.PNG);

            // var drawing = sheet.CreateDrawingPatriarch();

            // var anchor = new XSSFClientAnchor {
            //     Col1 = 0,
            //     Row1 = 0,
            //     Col2 = 5,
            //     Row2 = 1
            // };

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
            cell2.SetCellValue($"Nhân viên: {userID} - {fullName}");
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

            // Dữ liệu từ dòng 6
            for (int i = 0; i < checkinData.Count; i++)
            {
                var row = sheet.CreateRow(i + 6);

                DateTime checkin = checkinData[i].InAt?.AddHours(7) ?? DateTime.MinValue;
                DateTime checkout = checkinData[i].OutAt?.AddHours(7) ?? DateTime.MinValue;
                TimeSpan total = checkout - checkin - TimeSpan.FromHours(1);

                var cellIndex = 0;

                var cellNo = row.CreateCell(cellIndex++);
                cellNo.SetCellValue(i + 1);
                cellNo.CellStyle = centerStyle;

                var cellDate = row.CreateCell(cellIndex++);
                cellDate.SetCellValue(checkinData[i].InAt?.ToString("dd/MM/yyyy") ?? "N/A");
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

            return SendExcelNPOI(workbook, $"checkin-data-{userID}-{month}-{year}.xlsx");
        }


        private IActionResult SendExcelNPOI(XSSFWorkbook wb, string filename)
        {
            using var ms = new MemoryStream();
            wb.Write(ms);
            var content = ms.ToArray();
            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "report.xlsx");

        }
    }
}
