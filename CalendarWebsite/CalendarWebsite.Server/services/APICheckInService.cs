using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.Models;


namespace CalendarWebsite.Server.services
{
    public class APICheckInService : ICheckInDataService
    {

        private readonly ICheckInRepository _apiRepository;
        private readonly IPersonalProfileRepository _personalRepository;

        private readonly ICheckInRepository _checkinRepository;

        public APICheckInService(ICheckInRepository apiRepository, IPersonalProfileRepository personalRepository, ICheckInRepository checkinRepository)
        {
            _apiRepository = apiRepository;
            _personalRepository = personalRepository;
            _checkinRepository = checkinRepository;
        }

        public Task<int> CountRecordsByMonth(int month, int year, string userId)
        {
            return _apiRepository.CountRecordsByMonth(month, year, userId);
        }

        public Task<IEnumerable<DataOnly_APIaCheckIn>> Get()
        {
            return _apiRepository.GetAllAsync();
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetAllCheckinInDayRange(int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            DateTime startDate = new DateTime(year, month, day);
            DateTime endDate = new DateTime(yearTo, monthTo, dayTo).AddDays(1).AddTicks(-1);

            // return await _apiRepository.GetAllCheckinInDayRange(startDate, endDate);

            return await _apiRepository.FindList(
                predicate: e => e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate,
                disableTracking: true
            );


        }

        public async Task<IEnumerable<string>> GetAllUsersName()
        {
            return await _apiRepository.FindListSelect(
                 predicate: e => e.UserId != "NULL",
                 selector: e => e.UserId + " - " + e.FullName,
                 distinct: true
             );


        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetByDepartment(int id, int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            DateTime startDate = new DateTime(year, month, day);
            DateTime endDate = new DateTime(yearTo, monthTo, dayTo).AddDays(1).AddTicks(-1);

            var users = await _personalRepository.FindList(
                predicate: w => w.DepartmentId == id
            );
            List<DataOnly_APIaCheckIn> result = new List<DataOnly_APIaCheckIn>();
            foreach (var user in users)
            {
                if (user.Email != null)
                {
                    var foundUser = await _checkinRepository.FindList(
                        predicate: e => e.UserId == user.Email && e.At.HasValue && e.At.Value >= startDate && e.At.Value <= endDate
                    );

                    if (foundUser != null)
                    {
                        foreach (var each in foundUser)
                        {
                            result.Add(each);
                        }
                    }
                }
            }
            return result;
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetUserByUserId(int month, int year, string userID)
        {
            return await _apiRepository.FindList(
                predicate: w => w.UserId == userID && w.InAt.HasValue && w.InAt.Value.Month == month && w.InAt.Value.Year == year,
                orderBy: w => w.OrderBy(w => w.InAt)
            );

        }
    }
}
