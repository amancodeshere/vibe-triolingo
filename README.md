# 🌍 Vibe Triolingo - Modern Language Learning Platform

A production-ready, gamified language learning platform built with modern technologies. This is a professional Duolingo clone with enhanced features, beautiful UI, and full deployment capabilities on Railway.

## ✨ Features

### 🎯 Core Learning Features
- **Interactive Lessons**: Multiple choice, fill-in-the-blank, translation exercises
- **Progress Tracking**: Comprehensive learning analytics and progress visualization
- **Gamification**: Experience points, levels, streaks, and achievements
- **Multiple Languages**: Support for Spanish, French, German, Italian, Portuguese
- **Adaptive Learning**: Personalized lesson recommendations based on progress

### 🚀 Technical Features
- **Full-Stack Architecture**: Next.js 14 frontend + Node.js/Express backend
- **TypeScript**: Full type safety across the entire application
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS and Framer Motion
- **Real-time Updates**: Live progress tracking and achievement notifications
- **Authentication**: JWT-based secure authentication system
- **Database**: PostgreSQL with Prisma ORM for robust data management

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Themes**: Modern design system with consistent styling
- **Animations**: Smooth, engaging animations and micro-interactions
- **Accessibility**: Built with accessibility best practices

## 🏗️ Architecture

```
vibe-triolingo/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication & validation
│   │   └── index.ts        # Main server file
│   ├── prisma/             # Database schema & migrations
│   └── package.json        # Backend dependencies
├── frontend/                # Next.js 14 application
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   └── package.json        # Frontend dependencies
└── package.json            # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vibe-triolingo.git
cd vibe-triolingo
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your database credentials and JWT secret
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 5. Start Development Servers
```bash
# From root directory
npm run dev

# Or start individually:
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
```

## 🌐 Deployment on Railway

### 1. Railway Setup
1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`

### 2. Deploy Backend
```bash
cd backend
railway init
railway up
```

### 3. Deploy Frontend
```bash
cd frontend
railway init
railway up
```

### 4. Environment Variables
Set these in Railway dashboard:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure random string for JWT signing
- `NODE_ENV`: `production`
- `FRONTEND_URL`: Your frontend Railway URL

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Language Endpoints
- `GET /api/languages` - Get all languages
- `GET /api/languages/:id` - Get language details
- `POST /api/languages/:id/enroll` - Enroll in language

### Lesson Endpoints
- `GET /api/lessons/language/:languageId` - Get lessons for language
- `GET /api/lessons/:id` - Get lesson with exercises
- `POST /api/lessons/:id/complete` - Complete lesson

### Progress Endpoints
- `GET /api/progress/overview` - Get learning overview
- `GET /api/progress/language/:languageId` - Get language progress
- `GET /api/progress/analytics` - Get learning analytics

## 🎨 Customization

### Adding New Languages
1. Add language to `backend/prisma/schema.prisma`
2. Create lessons and exercises in `backend/prisma/seed.ts`
3. Add language flag and metadata

### Custom Exercise Types
1. Extend the Exercise model in Prisma schema
2. Add exercise logic in lesson routes
3. Update frontend exercise components

### UI Theming
- Colors: Modify `frontend/tailwind.config.js`
- Components: Edit `frontend/components/ui/`
- Global styles: Update `frontend/app/globals.css`

## 🔧 Development

### Code Structure
- **Backend**: RESTful API with Express.js
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + Zustand
- **Animations**: Framer Motion

### Scripts
```bash
# Development
npm run dev              # Start both servers
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Building
npm run build            # Build both applications
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run end-to-end tests
```

## 📊 Performance & Monitoring

### Backend Monitoring
- Health check endpoint: `/health`
- Request logging with Morgan
- Error tracking and reporting
- Performance metrics

### Frontend Optimization
- Next.js 14 optimizations
- Image optimization
- Code splitting
- Bundle analysis

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Duolingo's gamified learning approach
- Built with modern web technologies
- Designed for production deployment
- Community-driven development

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/vibe-triolingo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vibe-triolingo/discussions)
- **Email**: support@vibetriolingo.com

---

**Made with ❤️ by the Vibe Triolingo Team**

*Start your language learning journey today! 🌍✨*