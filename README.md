# Fluxa AI Backend

A comprehensive Node.js/Express API for AI automation, lead management, CRM, workflow automation, and business analytics.

## Features

- User authentication (JWT)
- Lead capture and management
- Client profile management
- Workflow automation
- Analytics and reporting
- Contact form handling
- MongoDB integration
- CORS enabled for frontend integration

## Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/biihafidh/fluxa-ai-backend.git
cd fluxa-ai-backend
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string
- `FRONTEND_URL`: Frontend application URL
- `PORT`: Server port (default: 5000)

### Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Leads
- `GET /api/leads/:clientId` - Get all leads
- `POST /api/leads` - Create new lead
- `GET /api/leads/detail/:id` - Get lead details
- `PUT /api/leads/:id` - Update lead
- `POST /api/leads/:id/score` - Score a lead

### Clients
- `GET /api/clients/profile/:userId` - Get client profile
- `POST /api/clients` - Create client profile
- `PUT /api/clients/:id` - Update client profile
- `GET /api/clients/dashboard/:clientId` - Get dashboard data

### Workflows
- `GET /api/workflows/:clientId` - Get all workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/:id/activate` - Activate workflow
- `POST /api/workflows/:id/pause` - Pause workflow

### Analytics
- `GET /api/analytics/leads/:clientId` - Lead analytics
- `GET /api/analytics/workflows/:clientId` - Workflow analytics

### Contacts
- `POST /api/contacts` - Submit contact form
- `GET /api/contacts` - Get all contacts

### Health Check
- `GET /api/health` - API health status

## Database Models

### User
- Email, password (hashed), name, company, role, status

### Lead
- Contact info, status, score, source, tags, custom fields

### Client
- Business info, plan, automation status, metrics

### Workflow
- Name, type, trigger, steps, status, performance metrics

### Contact
- Form submission data from website

## Integration with Frontend

The frontend should:
1. Register/login users
2. Store JWT token in localStorage
3. Include token in Authorization header: `Bearer <token>`
4. Call endpoints with appropriate clientId

## Deployment

Recommended platforms:
- Heroku
- AWS EC2
- DigitalOcean
- Railway.app

## License

MIT
