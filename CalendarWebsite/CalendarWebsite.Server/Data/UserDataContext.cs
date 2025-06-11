using CalendarWebsite.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarWebsite.Server.Data
{
    public class UserDataContext(DbContextOptions<UserDataContext> options) : DbContext(options)
    {
        public DbSet<DataOnly_APIaCheckIn> Users { get; set; }

        public DbSet<PersonalProfile> PersonalProfiles { get; set; }

        public DbSet<Department> Department { get; set; }

        public DbSet<LeaveRequest> LeaveRequests { get; set; }

        public DbSet<CustomWorkingTime> CustomWorkingTimes { get; set; }

        public DbSet<Workweek> Workweeks { get; set; }

        public DbSet<MeetingRoom> MeetingRooms { get; set; }

        public DbSet<CalendarEvent> CalendarEvents {get; set;}

        public DbSet<EventAttendee> EventAttendees {get; set;}

        public DbSet<EventAttachment> EventAttachments {get; set;}
    }
}
