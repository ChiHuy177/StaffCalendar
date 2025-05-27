namespace CalendarWebsite.Server.Models
{
    public class AuthUser
    {
        public string? Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }

        public string? Picture { get; set; }

        public string? Role { get; set; }

        public string? Gender { get; set; }

        public static AuthUser FromClaims(IEnumerable<System.Security.Claims.Claim> claims)
        {
            var user = new AuthUser();

            foreach (var claim in claims)
            {
                switch (claim.Type)
                {
                    case "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier":
                        user.Id = claim.Value;
                        break;
                    case "name":
                        if (claim.Value.StartsWith("["))
                        {
                            try
                            {
                                var names = System.Text.Json.JsonSerializer.Deserialize<List<string>>(claim.Value);
                                if (names?.Count > 1) user.FullName = names[1];
                            }
                            catch
                            {
                                user.FullName = claim.Value;
                            }
                        }
                        else
                        {
                            user.FullName = claim.Value;
                        }
                        break;
                    case "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":
                        user.Email = claim.Value;
                        break;
                    case "picture":
                        if (claim.Value.StartsWith("["))
                        {
                            try
                            {
                                var names = System.Text.Json.JsonSerializer.Deserialize<List<string>>(claim.Value);
                                if (names?.Count > 1) user.Picture = names[1];
                            }
                            catch
                            {
                                user.Picture = claim.Value;
                            }
                        }
                        else
                        {
                            user.Picture = claim.Value;
                        }
                        break;
                    case "role":
                        if (claim.Value.StartsWith("["))
                        {
                            try
                            {
                                var names = System.Text.Json.JsonSerializer.Deserialize<List<string>>(claim.Value);
                                if (names?.Count > 1) user.Role = names[1];
                            }
                            catch
                            {
                                user.Role = claim.Value;
                            }
                        }
                        else
                        {
                            user.Role = claim.Value;
                        }
                        break;
                    case "gender":
                        if (claim.Value.StartsWith("["))
                        {
                            try
                            {
                                var names = System.Text.Json.JsonSerializer.Deserialize<List<string>>(claim.Value);
                                if (names?.Count > 1) user.Gender = names[1];
                            }
                            catch
                            {
                                user.Gender = claim.Value;
                            }
                        }
                        else
                        {
                            user.Gender = claim.Value;
                        }
                        break;
                }
            }

            return user;
        }
    }
}
