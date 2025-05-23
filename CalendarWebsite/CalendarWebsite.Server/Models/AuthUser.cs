namespace CalendarWebsite.Server.Models
{
    public class AuthUser
    {
        public string? Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }

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
                            // Xử lý trường hợp name là mảng JSON
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
                }
            }

            return user;
        }
    }
}
