using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces.serviceInterfaces
{
    public interface IDepartmentService
    {
        public Task<IEnumerable<Department>> GetAllDepartment();

        public Task<Department> GetDepartmentById(long id);
    }
}
