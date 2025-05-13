using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface ILeaveRequestService
    {
        public Task<IEnumerable<LeaveRequest>> GetLeaveRequests();
    }
}
