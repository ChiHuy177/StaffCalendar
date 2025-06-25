using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.interfaces;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using CalendarWebsite.Server.Interfaces.ServiceInterfaces;
using CalendarWebsite.Server.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CalendarWebsite.Server.Services
{
    public class CalendarEventService : ICalendarEventService
    {
        private readonly ICalendarEventRepository _calendarEventRepository;
        private readonly IEventAttendeeRepository _eventAttendeeRepository;
        private readonly IFileService _fileService;
        private readonly IMeetingRoomRepository _meetingRoomRepository;
        private readonly IMeetingRoomService _meetingRoomService;
        private readonly UserDataContext _context;
        public CalendarEventService(ICalendarEventRepository calendarEventRepository,
            IEventAttendeeRepository eventAttendeeRepository,
            UserDataContext userDataContext,
            IFileService fileService,
            IMeetingRoomRepository meetingRoomRepository,
            IMeetingRoomService meetingRoomService)
        {
            _calendarEventRepository = calendarEventRepository;
            _eventAttendeeRepository = eventAttendeeRepository;
            _context = userDataContext;
            _fileService = fileService;
            _meetingRoomRepository = meetingRoomRepository;
            _meetingRoomService = meetingRoomService;
        }

        public async Task AddNewEvent(CalendarEvent calendarEvent)
        {
            try
            {
                await _calendarEventRepository.AddAsync(calendarEvent);

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error when adding calendar event: {ex.Message}");
                throw;
            }
        }

        public async Task<CalendarEvent> CreateEventWithAttendees(CreateEventDTO createEventDTO)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate meeting room exists - only if MeetingRoomId is provided
                if (createEventDTO.Event.MeetingRoomId.HasValue)
                {
                    var meetingRoom = await _meetingRoomRepository.GetByIdAsync(createEventDTO.Event.MeetingRoomId.Value);
                    if (meetingRoom != null)
                    {
                        var isRoomAvailable = await _meetingRoomService.IsRoomAvailable(
                            createEventDTO.Event.MeetingRoomId.Value,
                            createEventDTO.Event.StartTime,
                            createEventDTO.Event.EndTime
                        );

                        if (!isRoomAvailable)
                        {
                            throw new Exception("This room is not available");
                        }
                    }
                }

                // Validate attendees exist
                foreach (var attendeeId in createEventDTO.AttendeeIds)
                {
                    var attendee = await _context.PersonalProfiles.FindAsync(attendeeId);
                    if (attendee == null)
                    {
                        throw new Exception($"Người dùng với ID {attendeeId} không tồn tại");
                    }
                }

                //create event
                var newEvent = await _calendarEventRepository.AddAsync(createEventDTO.Event);

                //create event attendees
                var eventAttendees = createEventDTO.AttendeeIds.Select(attendeeId => new EventAttendee
                {
                    EventId = newEvent.Id,
                    PersonalProfileId = attendeeId,
                    ApprovalStatus = false
                }).ToList();

                foreach (EventAttendee eventAttendee in eventAttendees)
                {
                    await _eventAttendeeRepository.AddAsync(eventAttendee);
                }

                //xử lý attachment file
                if (createEventDTO.TempFiles != null && createEventDTO.TempFiles.Any())
                {
                    foreach (var tempFile in createEventDTO.TempFiles)
                    {
                        await _fileService.MoveTempToPermanent(
                            newEvent.Id,
                            tempFile.TempFileName,
                            tempFile.OriginalFileName,
                            tempFile.FileType,
                            tempFile.FileSize
                        );
                    }
                }

                //commit transaction
                await transaction.CommitAsync();
                return newEvent;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Lỗi khi tạo sự kiện: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public Task DeleteEvent(long id)
        {
            _calendarEventRepository.DeleteAsyncByKey(id);
            return Task.CompletedTask;
        }

        public Task<List<CalendarEvent>> GetAllEventByUserId(long userId)
        {
            // var result = _calendarEventRepository.FindList(
            //     predicate: each => each.CreatedBy == userId
            // );
            return null;
        }

        public async Task<List<CalendarEvent>> GetAllMeetingEvents()
        {


            var baseEvents = await _calendarEventRepository.FindList(
                predicate: x => true
            );

            var allEvents = new List<CalendarEvent>();

            foreach (var baseEvent in baseEvents)
            {
                allEvents.Add(baseEvent);

                if (baseEvent.RecurrentType == "Weekly")
                {
                    var weeklyEvents = GenerateWeeklyRecurrences(baseEvent, 12);
                    allEvents.AddRange(weeklyEvents);
                }
                else if (baseEvent.RecurrentType == "Monthly")
                {
                    var monthlyEvents = GenerateMonthlyRecurrences(baseEvent, 12);
                    allEvents.AddRange(monthlyEvents);
                }
            }

            return allEvents;
        }

        public async Task<List<CalendarEvent>> GetEventsByRange(DateTime start, DateTime end)
        {
            var baseEvents = await _calendarEventRepository.FindList(x => !x.IsDeleted);

            var result = new List<CalendarEvent>();

            foreach (var ev in baseEvents)
            {
                if (ev.RecurrentType == "Default")
                {
                    if (ev.StartTime <= end && ev.EndTime >= start)
                    {
                        result.Add(ev);
                    }
                }
                else if (ev.RecurrentType == "Weekly")
                {
                    var current = ev.StartTime;
                    while (current <= end)
                    {
                        var instanceEnd = ev.EndTime.AddDays((current - ev.StartTime).TotalDays);
                        if (current >= start && current <= end)
                        {
                            result.Add(new CalendarEvent
                            {
                                // Tạo ID riêng biệt nếu cần
                                Id = ev.Id,
                                Title = ev.Title,
                                Description = ev.Description,
                                EventType = ev.EventType,
                                StartTime = current,
                                EndTime = instanceEnd,
                                CreatedBy = ev.CreatedBy,
                                CreatedTime = ev.CreatedTime,
                                RecurrentType = ev.RecurrentType,
                                IsDeleted = false,
                                MeetingRoomId = ev.MeetingRoomId
                            });
                        }
                        current = current.AddDays(7);
                    }
                }
                else if (ev.RecurrentType == "Monthly")
                {
                    var current = ev.StartTime;
                    while (current <= end)
                    {
                        var instanceEnd = ev.EndTime.AddMonths((current.Month - ev.StartTime.Month) + 12 * (current.Year - ev.StartTime.Year));
                        if (current >= start && current <= end)
                        {
                            result.Add(new CalendarEvent
                            {
                                Id = ev.Id,
                                Title = ev.Title,
                                Description = ev.Description,
                                EventType = ev.EventType,
                                StartTime = current,
                                EndTime = instanceEnd,
                                CreatedBy = ev.CreatedBy,
                                CreatedTime = ev.CreatedTime,
                                RecurrentType = ev.RecurrentType,
                                IsDeleted = false,
                                MeetingRoomId = ev.MeetingRoomId
                            });
                        }
                        current = current.AddMonths(1);
                    }
                }

            }
            return result;
        }

        public Task UpdateEvent(CalendarEvent calendarEvent)
        {
            throw new NotImplementedException();
        }

        private List<CalendarEvent> GenerateWeeklyRecurrences(CalendarEvent baseEvent, int weeks)
        {
            var events = new List<CalendarEvent>();

            for (int i = 1; i <= weeks; i++)
            {
                var newEvent = new CalendarEvent
                {
                    Id = baseEvent.Id * 1000 + i,
                    Title = baseEvent.Title,
                    Description = baseEvent.Description,
                    EventType = baseEvent.EventType,
                    StartTime = baseEvent.StartTime.AddDays(7 * i),
                    EndTime = baseEvent.EndTime.AddDays(7 * i),
                    CreatedBy = baseEvent.CreatedBy,
                    CreatedTime = baseEvent.CreatedTime,
                    RecurrentType = baseEvent.RecurrentType,
                    IsDeleted = false,
                    MeetingRoomId = baseEvent.MeetingRoomId
                };
                events.Add(newEvent);
            }
            return events;
        }

        private List<CalendarEvent> GenerateMonthlyRecurrences(CalendarEvent baseEvent, int month)
        {
            var events = new List<CalendarEvent>();

            for (int i = 1; i <= month; i++)
            {
                var newEvent = new CalendarEvent
                {
                    Id = baseEvent.Id * 1000 + i,
                    Title = baseEvent.Title,
                    Description = baseEvent.Description,
                    EventType = baseEvent.EventType,
                    StartTime = baseEvent.StartTime.AddMonths(i),
                    EndTime = baseEvent.EndTime.AddMonths(i),
                    CreatedBy = baseEvent.CreatedBy,
                    CreatedTime = baseEvent.CreatedTime,
                    RecurrentType = "Monthly",
                    IsDeleted = false,
                    MeetingRoomId = baseEvent.MeetingRoomId
                };
                events.Add(newEvent);
            }
            return events;
        }
    }
}
