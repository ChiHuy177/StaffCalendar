# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only server project files
COPY ["CalendarWebsite.Server/CalendarWebsite.Server.csproj", "CalendarWebsite.Server/"]
RUN dotnet restore "CalendarWebsite.Server/CalendarWebsite.Server.csproj"

# Copy only server source code
COPY ["CalendarWebsite.Server/Controllers", "CalendarWebsite.Server/Controllers/"]
COPY ["CalendarWebsite.Server/Models", "CalendarWebsite.Server/Models/"]
COPY ["CalendarWebsite.Server/Services", "CalendarWebsite.Server/Services/"]
COPY ["CalendarWebsite.Server/Repositories", "CalendarWebsite.Server/Repositories/"]
COPY ["CalendarWebsite.Server/Data", "CalendarWebsite.Server/Data/"]
COPY ["CalendarWebsite.Server/Interfaces", "CalendarWebsite.Server/Interfaces/"]
COPY ["CalendarWebsite.Server/Program.cs", "CalendarWebsite.Server/"]
COPY ["CalendarWebsite.Server/appsettings*.json", "CalendarWebsite.Server/"]

# Build and publish
WORKDIR "/src/CalendarWebsite.Server"
RUN dotnet build "CalendarWebsite.Server.csproj" -c Release -o /app/build
RUN dotnet publish "CalendarWebsite.Server.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 80
EXPOSE 443
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"] 