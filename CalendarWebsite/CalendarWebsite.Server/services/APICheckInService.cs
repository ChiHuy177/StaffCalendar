using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

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
            return _apiRepository.Get();
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetAllCheckinInDayRange(int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            DateTime startDate = new DateTime(year, month, day);
            DateTime endDate = new DateTime(yearTo, monthTo, dayTo).AddDays(1).AddTicks(-1);

            return await _apiRepository.GetAllCheckinInDayRange(startDate, endDate);
        }

        public Task<IEnumerable<string>> GetAllUsersName()
        {
            return _apiRepository.GetAllUsersName();
        }

        public async Task<IEnumerable<DataOnly_APIaCheckIn>> GetByDepartment(int id, int day, int month, int year, int dayTo, int monthTo, int yearTo)
        {
            DateTime startDate = new DateTime(year, month, day);
            DateTime endDate = new DateTime(yearTo, monthTo, dayTo).AddDays(1).AddTicks(-1);

            var users = await _personalRepository.GetByDepartmentId(id);
            List<DataOnly_APIaCheckIn> result = new List<DataOnly_APIaCheckIn>();
            foreach (var user in users)
            {
                if (user.Email != null)
                {
                    var foundUser = await _checkinRepository.GetByEmailAndDateRange(user.Email, startDate, endDate);
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

        public Task<IEnumerable<DataOnly_APIaCheckIn>> GetUserByUserId(int month, int year, string userID)
        {
            return _apiRepository.GetUserByUserId(month, year, userID);
        }
    }
}
