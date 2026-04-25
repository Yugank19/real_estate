# ProVal: Multi-Factor Real Estate Market Valuation

ProVal is a premium, full-stack real estate valuation platform that leverages Machine Learning to provide accurate property price predictions. The system is built with a microservices-inspired architecture, featuring a robust Spring Boot backend, a modern React frontend, and a dedicated Python ML service.

## 🚀 Features

- **ML-Powered Valuation**: Predict property prices based on multiple factors (location, size, amenities, year built, etc.).
- **Interactive Dashboard**: Visualize market trends and property data with dynamic charts (Recharts).
- **Secure Authentication**: User registration and login powered by Spring Security and JWT.
- **Premium UI/UX**: A sleek, responsive interface built with React, Tailwind CSS, and Framer Motion animations.
- **Real-time Connectivity**: Seamless communication between the React frontend, Spring Boot API, and Python Flask ML microservice.

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.4
- **Language**: Java 17
- **Database**: MySQL with Spring Data JPA
- **Security**: Spring Security & JWT (JSON Web Token)
- **Other**: Lombok, Hibernate

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **State Management/API**: Axios

### ML Service
- **Framework**: Flask
- **Language**: Python 3.x
- **Libraries**: Scikit-learn, Pandas, NumPy

## 📂 Project Structure

```text
project_Spring_boot/
├── backend/            # Spring Boot Application
├── frontend/           # React Application (Vite)
├── ml_service/         # Python ML Microservice & Model
├── dataset/            # Property data and CSVs
└── run_project.bat     # Automation script to start all services
```

## 🚦 Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js** (v18+) & **npm**
- **Python 3.8+** & **pip**
- **Maven** (for backend)
- **MySQL Server**

### Setup & Run
The easiest way to run the entire project is using the provided automation script:

1. **Configure Database**: Update `backend/real-estate-backend/src/main/resources/application.properties` with your MySQL credentials.
2. **Execute Script**:
   ```bash
   ./run_project.bat
   ```
   This will:
   - Install Python dependencies.
   - Start the ML Service on port `5000`.
   - Start the Spring Boot Backend on port `8080`.
   - Start the React Frontend on port `5173`.

### Manual Startup (Alternative)

**ML Service:**
```bash
cd ml_service
pip install -r requirements.txt
python ml_service.py
```

**Backend:**
```bash
cd backend/real-estate-backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend/real-estate-frontend
npm install
npm run dev
```

## 📊 API Endpoints (Quick Reference)

- **ML Health Check**: `GET http://localhost:5000/health`
- **Backend API**: `http://localhost:8080/api`
- **Frontend UI**: `http://localhost:5173`

## 📄 License
This project is for educational purposes as part of the Advanced Java Coursework.
