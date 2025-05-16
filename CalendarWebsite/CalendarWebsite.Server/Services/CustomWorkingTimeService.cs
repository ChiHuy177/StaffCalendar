using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Services
{
    public class CustomWorkingTimeService : ICustomWorkingTimeService
    {
        private readonly ICustomWorkingTimeRepository _customWorkingTimeRepository;
        private readonly IWorkingWeekService _workWeekService;

        public CustomWorkingTimeService(ICustomWorkingTimeRepository customWorkingTimeRepository, IWorkingWeekService workWeekService)
        {
            _customWorkingTimeRepository = customWorkingTimeRepository;
            _workWeekService = workWeekService;
        }

        public async Task AddCustomWorkingTime(CustomWorkingTime customWorkingTime)
        {
            try
            {
                Console.WriteLine($"CustomWorkingTimeService: Đang thêm CustomWorkingTime với Id={customWorkingTime.Id}, WorkweekId={customWorkingTime.WorkweekId}, PersonalProfileId={customWorkingTime.PersonalProfileId}");
                await _customWorkingTimeRepository.AddAsync(customWorkingTime);
                Console.WriteLine("CustomWorkingTimeService: Đã gọi repository.AddAsync thành công");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CustomWorkingTimeService: Lỗi khi thêm CustomWorkingTime: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"CustomWorkingTimeService: Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public Task DeleteCustomWorkingTime(long id)
        {
            _customWorkingTimeRepository.DeleteAsyncByKey(id);
            return Task.CompletedTask;
        }

        public async Task<IEnumerable<CustomWorkingTime>> GetAllCustomWorkingTime()
        {
            var data = await _customWorkingTimeRepository.FindList(
                predicate: each => each.IsDeleted == false
            );
            return data;
        }
        

        public async Task<IEnumerable<CustomWorkingTimeDTO>> GetAllCustomWorkingTimeDTO()
        {
            var data = await _customWorkingTimeRepository.FindList(
                predicate: each => each.IsDeleted == false
            );
            
            var dtos = new List<CustomWorkingTimeDTO>();
            foreach (var x in data)
            {
                var workweekTitle = await _workWeekService.GetWorkweekTitleById(x.WorkweekId);
                Console.WriteLine(workweekTitle);
                var dto = new CustomWorkingTimeDTO
                {
                    Id = x.Id,
                    PersonalProfileId = x.PersonalProfileId,
                    WorkweekTitle = workweekTitle,
                    MorningStart = x.MorningStart,
                    MorningEnd = x.MorningEnd,
                    AfternoonStart = x.AfternoonStart,
                    AfternoonEnd = x.AfternoonEnd,
                    CreatedBy = x.CreatedBy,
                    CreatedTime = x.CreatedTime,
                    LastModified = x.LastModified,
                    ModifiedBy = x.ModifiedBy,
                    IsDeleted = x.IsDeleted
                };
                dtos.Add(dto);
            }
            
            return dtos;
        }

        public async Task<IEnumerable<CustomWorkingTime>> GetAllCustomWorkingTimeByPersonalProfileId(long personalProfileId)
        {
            var result = await _customWorkingTimeRepository.FindList(
                predicate: each => each.PersonalProfileId == personalProfileId && each.IsDeleted == false
            );
            return result;
        }
        public async Task<IEnumerable<CustomWorkingTimeDTO>> GetAllCustomWorkingTimeByPersonalProfileIdDTO(long personalProfileId)
        {
            var data = await _customWorkingTimeRepository.FindList(
                predicate: each => each.PersonalProfileId == personalProfileId && each.IsDeleted == false
            );

            var dtos = new List<CustomWorkingTimeDTO>();
            foreach (var x in data)
            {
                var workweekTitle = await _workWeekService.GetWorkweekTitleById(x.WorkweekId);
                Console.WriteLine(workweekTitle);
                var dto = new CustomWorkingTimeDTO
                {
                    Id = x.Id,
                    PersonalProfileId = x.PersonalProfileId,
                    WorkweekTitle = workweekTitle,
                    MorningStart = x.MorningStart,
                    MorningEnd = x.MorningEnd,
                    AfternoonStart = x.AfternoonStart,
                    AfternoonEnd = x.AfternoonEnd,
                    CreatedBy = x.CreatedBy,
                    CreatedTime = x.CreatedTime,
                    LastModified = x.LastModified,
                    ModifiedBy = x.ModifiedBy,
                    IsDeleted = x.IsDeleted
                };
                dtos.Add(dto);
            }

            return dtos;
        }
    }
}
