# Jira Lite - AI-Powered Issue Tracking System

A modern, full-featured issue tracking application similar to Jira, built with Next.js 14, TypeScript, and AI capabilities.

## 🚀 Features

### Core Features
- **Team Management**: Create teams, invite members, manage roles (OWNER, ADMIN, MEMBER)
- **Project Management**: Create projects, manage labels, custom states, and WIP limits
- **Issue Tracking**: Full CRUD operations for issues with Kanban board
- **AI Features**: 
  - Issue summarization
  - Solution suggestions
  - Duplicate detection
  - Auto-labeling
  - Supports both OpenAI and Anthropic Claude APIs

### Advanced Features
- **Dashboard**: Personal and team dashboards with statistical charts
- **Notifications**: In-app and email notifications for important events
- **Comments**: Thread-based comments on issues
- **Permissions**: Role-based access control (RBAC)
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript / JavaScript
- **Database**: SQLite (development) / MySQL (production) with Prisma ORM
- **Authentication**: NextAuth.js (Google OAuth + Credentials)
- **AI**: OpenAI API / Anthropic Claude API
- **UI**: Tailwind CSS, Lucide React Icons
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod validation
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- SQLite (for local development) or MySQL (for production)
- OpenAI API key or Anthropic Claude API key (optional, for AI features)
- SMTP credentials (optional, for email notifications)

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aijiralite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# AI Provider (choose one)
AI_PROVIDER="claude"  # or "openai"
ANTHROPIC_API_KEY="your-anthropic-key"
# OR
OPENAI_API_KEY="your-openai-key"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Create a test user (optional):
```bash
npm run create-test-user
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
aijiralite/
├── components/          # React components
│   ├── dashboard/       # Dashboard charts and stats
│   ├── forms/           # Form components
│   ├── issue/           # Issue-related components
│   ├── kanban/          # Kanban board components
│   ├── layout/          # Layout components (Navbar, etc.)
│   ├── lists/           # List components (TeamCard, ProjectCard)
│   ├── profile/         # Profile management
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── ai.js           # AI integration (OpenAI/Claude)
│   ├── auth.js         # Authentication helpers
│   ├── db.js           # Database connection
│   ├── email.js        # Email sending
│   ├── notifications.js # Notification system
│   └── permissions.js  # Permission checks
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard page
│   ├── issues/         # Issue pages
│   ├── projects/       # Project pages
│   └── teams/          # Team pages
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
├── scripts/            # Utility scripts
├── styles/             # Global styles
└── utils/              # Utility functions
```

## 🔐 Authentication

The app supports two authentication methods:
- **Google OAuth**: Sign in with Google account
- **Credentials**: Email/password authentication

## 👥 Team & Project Management

### Teams
- Create teams and invite members via email
- Role-based permissions:
  - **OWNER**: Full control (edit team, delete team, manage all members)
  - **ADMIN**: Can invite members and manage projects
  - **MEMBER**: Basic access (view team, create projects)

### Projects
- Create projects within teams
- Manage labels and custom states
- Set WIP (Work In Progress) limits
- Kanban board with drag-and-drop

## 🤖 AI Features

The app includes AI-powered features for issue management:

1. **Issue Summarization**: Automatically summarize long issue descriptions
2. **Solution Suggestions**: Get AI-generated suggestions for resolving issues
3. **Duplicate Detection**: Detect similar issues before creating new ones
4. **Auto-labeling**: Automatically suggest and apply labels based on issue content

**Rate Limiting**: 20 requests per minute with automatic retry (up to 2 retries)

## 📊 Dashboard

- **Personal Dashboard**: View your assigned issues, projects, and statistics
- **Team Dashboard**: View team-wide statistics and trends
- **Charts**: 
  - Issue status distribution (pie chart)
  - Priority distribution (bar chart)
  - Issue creation/completion trends (line chart)

## 🔔 Notifications

### In-App Notifications
- Notification icon in header with unread count
- Dropdown list of notifications
- Mark individual or all as read
- Navigate to related issues/projects

### Email Notifications
- Issue assigned
- Comment added
- Due date approaching (1 day before)
- Due date today
- Team invitation
- Role changed

## 🚢 Deployment

### Netlify
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Vercel
- AWS
- DigitalOcean
- Heroku

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push Prisma schema to database
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run create-test-user` - Create a test user
- `npm run clone-repos` - Clone all GitHub repositories (utility script)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by modern design systems
- AI powered by OpenAI and Anthropic

---

**Note**: Make sure to configure your environment variables before running the application. See `.env.example` for reference.
