using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.repositories
{
    public class DepartmentRepository : GenericRepository<Department>, IDeparmentRepository
    {
        // private readonly UserDataContext _context;

        public DepartmentRepository(UserDataContext dataContext) : base(dataContext)
        {
            // _context = dataContext;
        }

        //override nhỏ hơn 41 vì id lớn hơn 41 tên của các department bị lỗi (lỗi database)
        public async override Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _context.Department.Where(w => w.Id < 41).ToListAsync();
        }


    }
}
