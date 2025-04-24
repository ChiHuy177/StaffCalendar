using CalendarWebsite.Server.Data;
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
        public ExportController(UserDataContext context)
        {
            _context = context;
        }
        [HttpPost("HelloWorld")]
        public IActionResult Export()
        {
            using var wb = new XLWorkbook();

            var sheet = wb.AddWorksheet("Sheet 1");

            // We can use row and column to select a cell.
            sheet.Cell(1, 1).Value = "Hello";
            // Or we can use cell's address.
            sheet.Cell("B1").Value = "World";

            return SendExcel(wb, "hello-world.xlsx");
        }
        [HttpGet("ExportUserCheckinData")]
        public async Task<IActionResult> ExportUserCheckinData(int month, int year, string userID)
        {
            var checkinData = await _context.Users.Where(w => w.UserId == userID && w.InAt.HasValue && w.InAt.Value.Month == month && w.InAt.Value.Year == year)
                                .OrderBy(w => w.InAt).ToListAsync();

            // Step 2: Create Excel file
            using var wb = new XLWorkbook();
            var sheet = wb.AddWorksheet("Checkin Data");

            // Set column width
            sheet.Columns().Width = 20;
            sheet.Columns().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            // Add Header
            sheet.Range("A1:F1").Merge(); // Merge cells for the logo
            sheet.Cell("A1").Value = "VNTT";
            sheet.Cell("A1").Style.Font.Bold = true;
            sheet.Cell("A1").Style.Font.FontSize = 16;


            sheet.Range("A2:F2").Merge(); // Merge cells for the title
            sheet.Cell("A2").Value = "BÁO CÁO CHECK IN AND CHECK OUT";
            sheet.Cell("A2").Style.Font.Bold = true;
            sheet.Cell("A2").Style.Font.FontSize = 14;


            sheet.Range("A3:F3").Merge(); // Merge cells for the area
            sheet.Cell("A3").Value = "Nhân viên: " + userID + " - " + checkinData.FirstOrDefault()?.FullName;
            sheet.Cell("A3").Style.Font.Italic = true;


            sheet.Range("A4:F4").Merge(); // Merge cells for the date range
            sheet.Cell("A4").Value = "Thời gian: Tháng " + month + "/" + year;


            // headers
            sheet.Cell(6, 1).Value = "No";
            sheet.Cell(6, 2).Value = "Working Day";
            sheet.Cell(6, 3).Value = "Check-in Time";
            sheet.Cell(6, 4).Value = "Check-out Time";
            sheet.Cell(6, 5).Value = "Total working time";

            // Add data rows
            for (int i = 0; i < checkinData.Count; i++)
            {
                DateTime checkinTime = DateTime.Parse(checkinData[i].InAt.ToString() ?? "N/A").AddHours(7);
                string checkinTimeformatted = checkinTime.ToShortTimeString();

                DateTime checkoutTime = DateTime.Parse(checkinData[i].OutAt.ToString() ?? "N/A").AddHours(7);
                string checkoutTimeformatted = checkoutTime.ToShortTimeString();

                TimeSpan timeDifference = checkoutTime - checkinTime - 1 * TimeSpan.FromHours(1); // Subtract 1 hour for lunch break

                sheet.Cell(i + 7, 1).Value = i + 1; // Add serial number
                sheet.Cell(i + 7, 2).Value = checkinData[i].InAt?.ToString("dd/MM/yyyy") ?? "N/A";
                sheet.Cell(i + 7, 3).Value = checkinTimeformatted;
                sheet.Cell(i + 7, 4).Value = checkoutTimeformatted;
                sheet.Cell(i + 7, 5).Value = timeDifference.ToString(@"hh\:mm");
            }

            return SendExcel(wb, $"checkin-data-{userID}-{month}-{year}.xlsx");
        }

        [HttpGet("ExportUserCheckinDataByDay")]
        public async Task<IActionResult> ExportUserCheckinDataByDay(int day, int month, int year)
        {
            var checkinData = await _context.Users.Where(e => e.At.HasValue && e.At.Value.Day == day && e.At.HasValue && e.At.Value.Month == month && e.At.Value.Year == year)
                .ToListAsync();

            // Create Excel file
            using var wb = new XLWorkbook();
            var sheet = wb.AddWorksheet("Checkin Data By Day");

            // Set column width
            sheet.Columns().Width = 20;
            sheet.Columns().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            sheet.Columns().AdjustToContents();

            // Add Header
            sheet.Range("A1:F1").Merge(); // Merge cells for the logo
            sheet.Cell("A1").Value = "VNTT";
            sheet.Cell("A1").Style.Font.Bold = true;
            sheet.Cell("A1").Style.Font.FontSize = 16;


            sheet.Range("A2:F2").Merge(); // Merge cells for the title
            sheet.Cell("A2").Value = "BÁO CÁO CHECK IN AND CHECK OUT";
            sheet.Cell("A2").Style.Font.Bold = true;
            sheet.Cell("A2").Style.Font.FontSize = 14;

            sheet.Range("A4:F4").Merge(); // Merge cells for the date range
            sheet.Cell("A4").Value = "Thời gian: Ngày " + day + " tháng " + month + " năm " + year;


            // headers
            sheet.Cell(6, 1).Value = "No";
            sheet.Cell(6, 2).Value = "Full Name";
            sheet.Cell(6, 3).Value = "Check-in Time";
            sheet.Cell(6, 4).Value = "Check-out Time";
            sheet.Cell(6, 5).Value = "Total working time";

            // Add data rows
            for (int i = 0; i < checkinData.Count; i++)
            {
                DateTime checkinTime = DateTime.Parse(checkinData[i].InAt.ToString() ?? "N/A").AddHours(7);
                string checkinTimeformatted = checkinTime.ToShortTimeString();

                DateTime checkoutTime = DateTime.Parse(checkinData[i].OutAt.ToString() ?? "N/A").AddHours(7);
                string checkoutTimeformatted = checkoutTime.ToShortTimeString();

                TimeSpan timeDifference = checkoutTime - checkinTime - 1 * TimeSpan.FromHours(1); // Subtract 1 hour for lunch break

                sheet.Cell(i + 7, 1).Value = i + 1; // Add serial number
                sheet.Cell(i + 7, 2).Value = checkinData[i].FullName;
                sheet.Cell(i + 7, 3).Value = checkinTimeformatted;
                sheet.Cell(i + 7, 4).Value = checkoutTimeformatted;
                sheet.Cell(i + 7, 5).Value = timeDifference.ToString(@"hh\:mm");
            }

            return SendExcel(wb, $"checkin-data-{day}-{month}-{year}.xlsx");
        }

        [HttpGet("TestExportNPOI")]
        public IActionResult TestExportNPOI()
        {
            var workbook = new XSSFWorkbook();
            var sheet = workbook.CreateSheet("Demo");

            var headerRow = sheet.CreateRow(0);
            headerRow.CreateCell(0).SetCellValue("STT");
            headerRow.CreateCell(1).SetCellValue("Tên");

            var dataRow = sheet.CreateRow(0);
            dataRow.CreateCell(0).SetCellValue(1);
            dataRow.CreateCell(1).SetCellValue("A");

            return SendExcelNPOI(workbook, "testNPOI.xlsx");
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

        private IActionResult SendExcel(XLWorkbook wb, string filename)
        {
            var stream = new MemoryStream();
            wb.SaveAs(stream);
            stream.Position = 0;

            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
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
