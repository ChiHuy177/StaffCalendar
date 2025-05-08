using System.Linq.Expressions;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.Models;


namespace CalendarWebsite.Server.services
{
    public class APICheckInService : ICheckInDataService
    {


        private readonly IPersonalProfileRepository _personalRepository;

        private readonly ICheckInRepository _checkinRepository;

        public APICheckInService(IPersonalProfileRepository personalRepository, ICheckInRepository checkinRepository)
        {

            _personalRepository = personalRepository;
            _checkinRepository = checkinRepository;
        }

        public Task<int> CountRecordsByMonth(int month, int year, string userId)
        {
            return _checkinRepository.CountRecordsByMonth(month, year, userId);
        }

        public Task<IEnumerable<DataOnly_APIaCheckIn>> Get()
        {
            return _checkinRepository.GetAllAsync();
        }

        public async Task<(IEnumerable<DataOnly_APIaCheckIn> Items, int TotalCount)> GetAllCheckinInDayRangePaging(int day, int month, int year, int dayTo, int monthTo, int yearTo, int page, int pageSize)
        {
            DateTime startDate = new DateTime(year, month, day);
            DateTime endDate = new DateTime(yearTo, monthTo, dayTo).AddDays(1).AddTicks(-1);

            // return await _apiRepository.GetAllCheckinInDayRange(startDate, endDate);

            var (items, totalCount) = await _checkinRepository.FindListPagedAsync(
                predicate: e => e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate,
                disableTracking: true,
                page: page,
                pageSize: pageSize
            );

            return (items, totalCount);
        }

        public async Task<IEnumerable<string>> GetAllUsersName()
        {
            return await _checkinRepository.FindListSelect(
                 predicate: e => e.UserId != "NULL",
                 selector: e => e.UserId + " - " + e.FullName,
                 distinct: true
             );


        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetByDepartment(int id, int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            // Xác thực và tạo khoảng thời gian
            DateTime startDate;
            DateTime endDate;
            try
            {
                startDate = new DateTime(year, month, day);
                endDate = new DateTime(yearTo, monthTo, dayTo, 23, 59, 59, 999); // Bao gồm cả ngày cuối
            }
            catch (ArgumentOutOfRangeException)
            {
                throw new ArgumentException("Invalid date parameters.");
            }

            // Lấy danh sách Email của người dùng trong phòng ban
            var userEmails = await _personalRepository.FindListSelect(
                predicate: w => w.DepartmentId == id && w.Email != null,
                selector: w => w.Email!
            );

            if (!userEmails.Any())
            {
                return Enumerable.Empty<DataOnly_APIaCheckIn>();
            }

            // Lấy tất cả check-in cho các Email trong khoảng thời gian
            var checkins = await _checkinRepository.FindList(
                predicate: e => userEmails.Contains(e.UserId) && e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate
            );

            return checkins;
        }

        public async Task<(IEnumerable<DataOnly_APIaCheckIn> Items, int TotalCount)> GetUserByUserIdPaging(int month, int year, string userID, int page, int pageSize)
        {
            Expression<Func<DataOnly_APIaCheckIn, bool>> predicate = w =>
                w.UserId == userID &&
                w.InAt.HasValue &&
                w.InAt.Value.Month == month &&
                w.InAt.Value.Year == year;
            var (items, totalCount) = await _checkinRepository.FindListPagedAsync(
                predicate: predicate,
                page: page,
                pageSize: pageSize,
                orderBy: q => q.OrderBy(w => w.InAt)
            );
            return (items, totalCount);
        }
        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetUserByUserId(int month, int year, string userID)
        {
            Expression<Func<DataOnly_APIaCheckIn, bool>> predicate = w =>
                w.UserId == userID &&
                w.InAt.HasValue &&
                w.InAt.Value.Month == month &&
                w.InAt.Value.Year == year;
            return await _checkinRepository.FindList(
                predicate: predicate,
                orderBy: w => w.OrderBy(w => w.InAt)
            );

        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetAllCheckinInDayRange(int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            DateTime startDate = new DateTime(year, month, day);
            DateTime endDate = new DateTime(yearTo, monthTo, dayTo).AddDays(1).AddTicks(-1);

            return await _checkinRepository.FindList(
                predicate: e => e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate,
                disableTracking: true
            );
        }

        public async Task<(IEnumerable<DataOnly_APIaCheckIn> Items, int TotalCount)> GetByDepartmentPaging(int id, int day, int month, int year, int dayTo, int monthTo, int yearTo, int page, int pageSize)
        {
            DateTime startDate;
            DateTime endDate;
            try
            {
                startDate = new DateTime(year, month, day);
                endDate = new DateTime(yearTo, monthTo, dayTo, 23, 59, 59, 999); // Bao gồm cả ngày cuối
            }
            catch (ArgumentOutOfRangeException)
            {
                throw new ArgumentException("Invalid date parameters.");
            }

            // Lấy danh sách Email của người dùng trong phòng ban
            var userEmails = await _personalRepository.FindListSelect(
                predicate: w => w.DepartmentId == id && w.Email != null,
                selector: w => w.Email!
            );

            if (!userEmails.Any())
            {
                return (Enumerable.Empty<DataOnly_APIaCheckIn>() , 0);
            }

            // Lấy tất cả check-in cho các Email trong khoảng thời gian
            var (items, totalCount) = await _checkinRepository.FindListPagedAsync(
                predicate: e => userEmails.Contains(e.UserId) && e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate,
                page: page,
                pageSize: pageSize
            );

            return (items, totalCount);
        }
    
        public async Task<IEnumerable<string>> GetAllUserFullNameByDepartmentId(int id){
            var userEmails = await _personalRepository.FindListSelect(
                predicate: w => w.DepartmentId == id && w.Email != null,
                selector: w => w.Email!
            );
            var result2 = await _checkinRepository.FindListSelect(
                predicate: e => userEmails.Contains(e.UserId),
                selector: e => e.FullName,
                distinct: true

            );
            return result2;
        }
    }
}
