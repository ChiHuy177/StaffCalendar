
using Microsoft.AspNetCore.Mvc;
using CalendarWebsite.Server.Models;
using CalendarWebsite.Server.interfaces.serviceInterfaces;

namespace CalendarWebsite.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        // GET: api/Departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartment()
        {
            var result = await _departmentService.GetAllDepartment();
            return result == null ? NotFound() : Ok(result);
            
        }

        // GET: api/Departments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(long id)
        {
            var result = await _departmentService.GetDepartmentById(id);
            return result == null ? NotFound() : Ok(result);
        }
    }
}
