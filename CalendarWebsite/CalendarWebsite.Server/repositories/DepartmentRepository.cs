using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.repositories
{
    public class DepartmentRepository : IDeparmentRepository
    {
        private readonly UserDataContext _context;

        public DepartmentRepository(UserDataContext dataContext)
        {
            _context = dataContext;
        }

        public async Task<IEnumerable<Department>> GetAllDepartment()
        {
            return await _context.Department.Where(w => w.Id < 41).ToListAsync();
        }

        public async Task<Department> GetDepartmentById(long id)
        {
            return await _context.Department.FindAsync(id);
        }
    }
}
