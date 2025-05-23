using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDeparmentRepository _departmentRepository;

        public DepartmentService(IDeparmentRepository deparmentRepository)
        {
            _departmentRepository = deparmentRepository;
        }

        public async Task<IEnumerable<Department>> GetAllDepartment()
        {
            return await _departmentRepository.FindList(
                predicate: e => true,
                disableTracking: true
            );
        }

        public async Task<Department> GetDepartmentById(long id)
        {
            return await _departmentRepository.GetByIdAsync(id);
        }
    }
}
