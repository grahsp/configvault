# ConfigVault

ConfigVault is a platform for managing application configuration and secrets across multiple environments.

It provides project-based secret management, environment separation, role-based access control, encrypted storage, and revision history, allowing teams to securely collaborate on application configuration from a single place.

## Why

ConfigVault was created after experiencing the challenges of managing configuration values through manually maintained `.env` files during my internship.

As applications grow, configuration values often become duplicated across multiple environments and shared through informal channels such as chat applications and documentation. Keeping configuration synchronized between developers becomes increasingly difficult, often leading to inconsistent environments, deployment issues, and reduced visibility into who can access sensitive information.

The goal of ConfigVault was to explore how a centralized platform could improve security, consistency, and collaboration while remaining practical for smaller development teams.

## Links

- Project Website: https://configvault.dev
- Application: https://app.configvault.dev

For additional information about the project's motivation, architecture, and design decisions, visit the project website.

## Features

- Project-based secret management
- Environment-specific configuration
- Team collaboration through project memberships
- Invitation-based project access
- Role-based authorization
- Encrypted secret storage
- Secret revision history
- Import and export support

## Technical Highlights

- ASP.NET Core backend
- React and TypeScript frontend
- PostgreSQL database
- OAuth 2.0 / OpenID Connect authentication via Auth0
- Role-based authorization model
- Envelope encryption for secret storage
- CQRS-inspired application layer
- Layered architecture with domain-focused business logic
- Dockerized development environment
- Automated CI validation using GitHub Actions

## Architecture

ConfigVault consists of three primary services:

- React frontend
- ASP.NET Core API
- PostgreSQL database

The frontend communicates with the backend API, which is responsible for authentication integration, authorization, secret management, encryption, and persistence.

The backend follows a layered architecture consisting of:

- API Layer
- Application Layer
- Domain Layer
- Infrastructure Layer

CQRS-style request handling is used to separate commands and queries, while domain logic and validation are kept close to the related domain models.

## Security

### Authentication

Authentication is handled through Auth0 using OpenID Connect and OAuth 2.0.

Authenticated requests include JWT access tokens that are validated by the backend before protected resources are accessed.

### Authorization

Authorization is implemented using project memberships, roles, and capabilities.

Permissions are evaluated centrally within the backend to control access to projects, environments, and secrets.

### Encryption

Secrets are encrypted before being stored in the database.

The platform uses an envelope encryption model where:

- Each project has its own encryption key
- Secrets are encrypted using the project key
- Project keys are encrypted using a master key supplied at runtime

This limits the impact of a potential compromise by isolating encrypted data between projects.

Secret values are masked by default and only revealed to authorized users when explicitly requested.

## Running Locally

### Prerequisites

- Docker
- Docker Compose

### Start the application

```bash
docker compose up --build
```

The application will start the frontend, backend, and PostgreSQL database using Docker Compose.

## Testing

Backend tests are implemented using xUnit.

Integration tests use Testcontainers to provision temporary PostgreSQL instances during test execution, allowing database-related functionality to be tested against a real PostgreSQL environment.

## Future Improvements

Potential future areas of development include:

- Service accounts and machine authentication
- Runtime secret injection workflows
- Secret rotation
- Auditing and monitoring
- Expanded CI/CD integration
- More granular permission models

## License

This project is licensed under the MIT License.
