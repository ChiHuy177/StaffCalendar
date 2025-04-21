using CalendarWebsite.Server.Data;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            sheet.Cell("A4").Value = "Thời gian: Ngày " + day +  " tháng " + month + " năm " + year;


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

        private IActionResult SendExcel(XLWorkbook wb, string filename)
        {
            var stream = new MemoryStream();
            wb.SaveAs(stream);
            stream.Position = 0;

            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
        }
    }
}
