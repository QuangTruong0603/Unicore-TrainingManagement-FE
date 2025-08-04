# Unicore Training Management System

A microservices-based university training management platform. This project consists of:
- **WebApp**: A modern Next.js frontend for all user roles.
- **Microservices**: Independent backend services for Courses, Enrollment, Users, Majors, Notifications, and more, orchestrated via Kubernetes (K8S).

---

## Project Overview

### Architecture
- **Frontend**: `WebApp/` (Next.js, TypeScript, HeroUI, Redux Toolkit)
- **Backend Microservices**: `Microservices/` (C# .NET, each service in its own directory)
- **Deployment**: Kubernetes manifests in `Microservices/K8S/` for scalable, containerized deployment

### Microservices Summary

- **CourseService**: Manages courses, course groups, and related academic data. Built with ASP.NET Core, uses SQL Server, supports JWT authentication, exposes REST and gRPC endpoints, and provides Swagger documentation.
- **EnrollmentService**: Handles student enrollments, class registration, and related workflows. Integrates with Redis for distributed locking, supports JWT authentication, and exposes REST/gRPC APIs.
- **UserService**: Manages user accounts, authentication, roles (Admin, Student, Lecturer, Training Manager), and profile data. Uses ASP.NET Identity, JWT, and provides REST/gRPC APIs.
- **MajorService**: Manages academic majors, major groups, and related mappings. Provides REST/gRPC APIs, supports JWT authentication, and integrates with other services.
- **NotificationService**: Handles email notifications (e.g., account verification), integrates with Kafka for event-driven messaging, and runs as a background worker.
- **K8S (Kubernetes)**: Contains deployment manifests for all services, databases, message brokers (Kafka, RabbitMQ), and ingress configuration for routing.

---

## Running & Deploying the System

### Running Microservices Locally

Each microservice is a .NET project and can be run independently. Here’s a general guide:

1. **Navigate to the service directory** (e.g., for CourseService):
   ```bash
   cd Microservices/CourseService/CourseService
   ```
2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```
3. **Apply database migrations (if needed):**
   ```bash
   dotnet ef database update
   ```
4. **Run the service:**
   ```bash
   dotnet run
   ```
> Repeat these steps for each service: CourseService, EnrollmentService, UserService, MajorService, NotificationService.

---

### Deploying with Kubernetes (K8S)

All deployment manifests are in `Microservices/K8S/`. Here’s how to deploy the full system:

1. **Ensure you have a running Kubernetes cluster** (e.g., Minikube, Docker Desktop, or a cloud provider).
2. **Apply Persistent Volume Claims (if needed):**
   ```bash
   kubectl apply -f Microservices/K8S/local-pvc.yaml
   ```
3. **Deploy databases and message brokers:**
   ```bash
   kubectl apply -f Microservices/K8S/mssql-plat-depl.yaml
   kubectl apply -f Microservices/K8S/redis-depl.yaml
   kubectl apply -f Microservices/K8S/kafka-depl.yaml
   kubectl apply -f Microservices/K8S/zookeeper.yaml
   kubectl apply -f Microservices/K8S/rabbitmq-depl.yaml
   ```
4. **Deploy microservices:**
   ```bash
   kubectl apply -f Microservices/K8S/course-depl.yaml
   kubectl apply -f Microservices/K8S/enrollment-depl.yaml
   kubectl apply -f Microservices/K8S/user-depl.yaml
   kubectl apply -f Microservices/K8S/major-depl.yaml
   kubectl apply -f Microservices/K8S/notification-depl.yaml
   ```
5. **Deploy ingress (for routing HTTP traffic):**
   ```bash
   kubectl apply -f Microservices/K8S/ingress-srv.yaml
   ```
6. **Check the status of your pods and services:**
   ```bash
   kubectl get pods
   kubectl get services
   ```
7. **Access the system:**
   - The ingress will expose the services. Check your ingress controller’s documentation for how to access the endpoints (often via `localhost` or a Minikube tunnel).

#### Notes
- You may need to adjust connection strings and environment variables in each service’s `appsettings.*.json` for your environment.
- For development, you can run services with Docker Compose or directly with `dotnet run`.
- For production, use the K8S manifests for scalable, orchestrated deployment.

---

# WebApp

A modern, full-featured university training management web application built with Next.js, TypeScript, Redux Toolkit, and HeroUI. This project provides comprehensive tools for managing courses, majors, students, lecturers, facilities, enrollments, exams, and more, supporting multiple user roles (Admin, Training Manager, Lecturer, Student).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Authentication & Role-based Access**: Secure login with JWT, supporting Admin, Training Manager, Lecturer, and Student roles.
- **Course Management**: Create, update, and manage courses and their descriptions.
- **Majors & Training Roadmaps**: Define academic majors and their training roadmaps.
- **Semester & Class Scheduling**: Configure semesters, class schedules, and registration periods.
- **Student & Lecturer Management**: Manage student and lecturer profiles, enrollments, and results.
- **Facilities Management**: Manage locations, buildings, floors, and rooms.
- **Analytics & Reporting**: Visualize academic data and class analytics.
- **Responsive UI**: Built with HeroUI and Tailwind CSS for a modern, accessible experience.
- **State Management**: Powered by Redux Toolkit and React Query for robust data handling.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 18)
- **Language**: TypeScript
- **UI Library**: [HeroUI](https://heroui.com/), Tailwind CSS, SCSS
- **State Management**: Redux Toolkit, React Query
- **Forms & Validation**: React Hook Form, Zod
- **Data Visualization**: Recharts
- **Other**: Axios, JWT, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd WebApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
WebApp/
  components/      # Reusable UI components (sidebar, navbar, dialogs, etc.)
  config/          # App-wide configuration (site, fonts)
  hooks/           # Custom React hooks (auth, dialogs, etc.)
  layouts/         # Layout components (default, head)
  pages/           # Next.js pages (routing, role-based dashboards)
  public/          # Static assets (images, icons)
  services/        # API services, DTOs, schemas for each domain
  store/           # Redux store, slices, and hooks
  styles/          # Global and page-specific styles (CSS, SCSS)
  types/           # TypeScript type definitions
```

## Available Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm start` – Start the production server
- `npm run lint` – Lint code with ESLint
- `npm run format` – Format code with Prettier
- `npm run check-format` – Check code formatting

## Configuration

- **TypeScript**: Configured via `tsconfig.json`
- **Next.js**: Custom config in `next.config.js` (redirects `/` to `/login`, React strict mode enabled)
- **Environment Variables**: Add your environment variables in a `.env.local` file as needed.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.