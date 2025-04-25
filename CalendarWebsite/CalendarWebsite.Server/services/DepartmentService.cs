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

        public Task<IEnumerable<Department>> GetAllDepartment()
        {
            return _departmentRepository.GetAllDepartment();
        }

        public async Task<Department> GetDepartmentById(long id)
        {
            return await _departmentRepository.GetDepartmentById(id);
        }
    }
}
