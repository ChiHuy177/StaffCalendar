﻿using CalendarWebsite.Server.interfaces.repositoryInterfaces;
using CalendarWebsite.Server.interfaces.serviceInterfaces;
using CalendarWebsite.Server.Models;

namespace CalendarWebsite.Server.services
{
    public class PersonalProfileService : IPersonalProfileService
    {
        private readonly IPersonalProfileRepository _personalRepository;

        public PersonalProfileService(IPersonalProfileRepository personalRepository)
        {
            _personalRepository = personalRepository;
        }

        public async Task<IEnumerable<string>> GetAllName()
        {   
            var result = await _personalRepository.FindListSelect(
                predicate: each => each.Email != null && each.FullName != null ,
                selector: each => each.Email + " - " + each.FullName,
                distinct: true,
                disableTracking: true
            );
            return result;         
        }

        public async Task<PersonalProfile> GetById(long id)
        {   
            return await _personalRepository.GetByIdAsync(id);
        }
    }
}
