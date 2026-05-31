
# ConfigVault

ConfigVault is a platform for managing application configuration and secrets across multiple environments.

It provides project-based secret management, environment-specific configuration, and role-based access control, allowing teams to securely collaborate on application configuration from a single place.

## Links

-   Project Website: [https://configvault.dev](https://configvault.dev/)
-   Application: [https://app.configvault.dev](https://app.configvault.dev/)

For additional information about the project's motivation, architecture, and design decisions, visit the project website.

## Features

-   Project-based secret management
    
-   Environment-specific configuration
    
-   Team collaboration through project memberships
    
-   Invitation-based project access
    
-   Role-based authorization
    
-   Secure secret storage with encryption at rest
    
-   Import and export support
	

## Architecture  
  
ConfigVault is composed of three primary services:  
  
- React frontend  
- ASP.NET Core API  
- PostgreSQL database  
  
The frontend communicates with the API, which handles authentication, authorization, secret management, and persistence. Authentication is delegated to Auth0, while PostgreSQL is used for storage.

## Technology Stack  
  
| Category | Technologies |  
|-----------|-------------|  
| Backend | ASP.NET Core, C# |  
| Frontend | React, TypeScript |  
| Database | PostgreSQL |  
| Authentication | Auth0, OAuth 2.0, OpenID Connect |  
| Infrastructure | Docker, Render, Cloudflare |

## Running Locally

### Prerequisites

-   Docker
-   Docker Compose    

### Start the application

```bash
docker compose up --build
```

The application consists of:
-   React frontend
-   ASP.NET Core API
-   PostgreSQL database
