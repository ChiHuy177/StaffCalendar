using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;
using Microsoft.AspNetCore.Mvc;



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

        // for testing
        // [HttpGet("ExportUserCheckinDataNPOI")]
        // public async Task<IActionResult> ExportUserCheckinDataNPOI(int month, int year, string userID)
        // {
        //    

        //     return SendExcelNPOI(workbook, $"checkin-data-{userID}-{month}-{year}.xlsx");
        // }


        // private IActionResult SendExcelNPOI(XSSFWorkbook wb, string filename)
        // {
        //     using var ms = new MemoryStream();
        //     wb.Write(ms);
        //     var content = ms.ToArray();
        //     return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //             "report.xlsx");

        // }
    }
}
