namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface IWorkingWeekService
    {
        public Task<long> GetWorkweekIdByTitle(string title);
    }
}
