using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.interfaces
{
    public interface IDeparmentRepository
    {
        public Task<IEnumerable<Department>> GetAllDepartment();

        public Task<Department> GetDepartmentById(long id);
    }
}