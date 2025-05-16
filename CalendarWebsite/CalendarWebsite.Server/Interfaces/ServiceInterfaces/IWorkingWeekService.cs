namespace CalendarWebsite.Server.Interfaces.ServiceInterfaces
{
    public interface IWorkingWeekService
    {
        public Task<long> GetWorkweekIdByTitle(string title);
        public Task<string> GetWorkweekTitleById(long id);
    }
}
