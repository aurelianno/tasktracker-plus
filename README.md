# TaskTracker+

TaskTracker+ is a modern, full-stack productivity and team collaboration platform. It enables individuals and teams to manage tasks, track progress, analyze productivity, and collaborate efficiently—all in a beautiful, responsive web application.

---

## 🚀 Features

- **Personal & Team Task Management:**
  - Create, edit, assign, and track personal and team tasks
  - Support for priorities, due dates, status, and tags
- **Advanced Analytics:**
  - Personal and team dashboards with KPIs, charts, and trends
  - Productivity heatmaps, completion rates, overdue tracking, and more
- **Team Collaboration:**
  - Team creation, invitations, and role management (admin, owner, collaborator)
  - Real-time team analytics and workload distribution
- **User Preferences:**
  - Dark/light mode, theme persistence, and user profile management
- **Billing & Subscription (Mock):**
  - Plan selection, payment method management, and subscription status
- **Integrations (Mock):**
  - Slack, Google Calendar, GitHub (connect/disconnect UI)
- **Security & Professionalism:**
  - JWT authentication, CORS, rate limiting, and secure password handling
  - Clean, well-documented codebase with no console logs in production

---

## 🛠️ Tech Stack

- **Frontend:** React, Redux Toolkit, Chart.js, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **DevOps:** Docker, Docker Compose, ESLint, Prettier

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/tasktracker-plus.git
   cd tasktracker-plus
   ```
2. **Install dependencies:**
   ```sh
   cd client && npm install
   cd ../server && npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in both `client/` and `server/` and update as needed.
4. **Start MongoDB:**
   - Make sure MongoDB is running locally or update the connection string in `.env`.
5. **Run the app:**
   - In one terminal:
     ```sh
     cd server && npm run dev
     ```
   - In another terminal:
     ```sh
     cd client && npm run dev
     ```
6. **Access the app:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

### Docker Setup (Optional)

1. **Build and run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
2. **Access as above.**

---

## 🤝 Contributing

We welcome contributions! To get started:
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

Please follow the code style and add comments/documentation as appropriate.

---

## 🛡️ Security & Best Practices
- No sensitive data or credentials in the codebase
- All console logs and comments are removed in production
- Follows modern security and code quality standards

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

- [Aureliano Ceballos](https://github.com/aureliannno)
- [LinkedIn](https://www.linkedin.com/in/aureliano-ceballos-17b085186/)

---

> _TaskTracker+ is designed to help you and your team work smarter, not harder. Happy tracking!_
