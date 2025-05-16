using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.Repositories
{
    public class CustomWorkingTimeRepository : GenericRepository<CustomWorkingTime>, ICustomWorkingTimeRepository
    {
        public CustomWorkingTimeRepository(UserDataContext context) : base(context)
        {
            
        }
        
    }
}
