# Staff Calendar Website

A modern web application for managing staff schedules and calendar events, built with React and TypeScript.

## Features

- Interactive calendar interface using FullCalendar
- Material UI components for a polished user experience
- Multi-language support with i18next
- Responsive design with Tailwind CSS
- Date and time management with dayjs
- Toast notifications for user feedback
- Data grid functionality for tabular data

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: 
  - Material UI (MUI)
  - Headless UI
  - Tailwind CSS
- **Calendar**: FullCalendar
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **Animations**: Framer Motion

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd calendarwebsite.client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` by default.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Structure

```
calendarwebsite.client/
├── src/              # Source files
├── public/           # Static assets
├── dist/             # Build output
├── node_modules/     # Dependencies
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.
