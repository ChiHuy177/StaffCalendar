FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app


COPY CalendarWebsite.Server.csproj ./
RUN dotnet restore


COPY . ./
RUN dotnet publish -c Release -o out


FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Chạy ứng dụng
ENTRYPOINT ["dotnet", "CalendarWebsite.Server.dll"]