# Staff Calendar

A modern web application for managing staff schedules, leave requests, and attendance tracking.

## Live Demo

Visit the live application at: https://staff-calendar-5efr.vercel.app/

## Features

- Interactive calendar interface for schedule management
- Leave request management system
- Staff attendance tracking
- Department management
- Personal profile management
- Export functionality for reports
- Multi-language support
- Responsive design

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Material-UI (MUI)
- FullCalendar
- TailwindCSS
- i18next for internationalization
- React Router for navigation
- Axios for API calls

### Backend
- ASP.NET Core
- Entity Framework Core
- SQL Server
- RESTful API architecture
- CORS enabled for multiple origins

## Project Structure

The project is divided into two main components:

### Client (`calendarwebsite.client/`)
- Modern React application built with Vite
- TypeScript for type safety
- Component-based architecture
- Responsive UI with Material-UI and TailwindCSS

### Server (`CalendarWebsite.Server/`)
- ASP.NET Core Web API
- Repository pattern implementation
- Service layer for business logic
- Entity Framework Core for data access
- SQL Server database

## Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- .NET 8 SDK
- SQL Server

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd CalendarWebsite/calendarwebsite.client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd CalendarWebsite/CalendarWebsite.Server
   ```
2. Restore NuGet packages
3. Update the connection string in `appsettings.json`
4. Run the application:
   ```bash
   dotnet run
   ```

## Deployment

The application is currently deployed on Vercel for the frontend and can be deployed to any compatible hosting service for the backend.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
