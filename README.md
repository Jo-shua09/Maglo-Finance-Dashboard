# Invoice Management System

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Jo-shua09/Maglo-Finance-Dashboard)

A modern, responsive web application for managing invoices, built with React, TypeScript, and Appwrite. This application allows users to create, view, edit, and track invoices with real-time analytics and a clean, intuitive interface.

## Features

- **User Authentication**: Secure login and signup with Appwrite authentication
- **Dashboard Analytics**: Visual overview of invoice statistics, including paid/unpaid amounts, VAT collected, and status charts
- **Invoice Management**:
  - Create new invoices with client details, amounts, VAT calculations
  - View detailed invoice information
  - Edit existing invoices
  - Track payment status (paid, unpaid, pending)
- **Responsive Design**: Optimized for desktop and mobile devices using Tailwind CSS
- **Real-time Data**: Integrated with Appwrite for seamless data synchronization
- **Modern UI**: Built with shadcn/ui components for a professional look and feel

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Appwrite (database and authentication)
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React and React Icons

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Jo-shua09/Maglo-Finance-Dashboard.git
   cd Maglo-Finance-Dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Appwrite**

   - Set up an Appwrite project at [appwrite.io](https://appwrite.io)
   - Create a database and collection for invoices
   - Update the Appwrite configuration in `src/integrations/appwrite/client.ts`

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Usage

1. **Sign Up/Login**: Create an account or log in to access the dashboard
2. **Dashboard**: View invoice statistics and recent invoices
3. **Create Invoice**: Use the "Create Invoice" button to add new invoices
4. **Manage Invoices**: View all invoices, edit details, and track payment status
5. **Invoice Details**: Click on any invoice to view full details

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Page components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
└── lib/                # Utility functions
```

## Deployment

This project can be deployed to various platforms:

- **Vercel/Netlify**: Connect your repository and deploy automatically
- **Custom Domain**: Configure in Lovable settings or your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
