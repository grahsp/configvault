
# KeyVault

## Overview

KeyVault is a configuration and secret management system designed to help development teams securely manage application configuration across environments.

The system allows teams to:

-   store configuration values and secrets
-   manage environment-specific configuration
-   track historical versions of configuration values
-   activate and rollback configuration safely
-   retrieve configuration bundles for applications

KeyVault supports both **public configuration values** and **encrypted secrets**, ensuring sensitive data remains protected while allowing flexible configuration management.

The project focuses on building a **minimal but production-hostable system first**, with additional infrastructure capabilities added later.


# Goals

## Product Goal

Provide a reliable system for teams to:

-   manage configuration across environments
-   securely store secrets
-   track configuration history
-   safely deploy configuration changes

---

## Engineering Goal

Build a deployable infrastructure service that demonstrates:

-   clean domain-driven design
-   secure secret handling
-   versioned configuration management
-   scalable backend architecture
-   maintainable API design

---

# Non-Goals (MVP)

The initial version intentionally excludes more complex features.

Not part of the MVP:

-   CLI tooling
-   runtime secret injection
-   service accounts
-   access policy systems
-   automated secret rotation
-   audit logging
-   SaaS multi-tenancy
-   advanced permission models

These capabilities may be introduced later.

---

# Core Capability

The central capability of KeyVault is:

> Securely store configuration values and retrieve the active value for a specific environment.

Everything else builds on top of this functionality.

---

# Domain Model

The system organizes configuration using the following domain structure:

```bash
Tenant  
 └ Project  
 ├ Environments  
 └ ConfigKeys  
 └ ConfigValues  
 └ Revisions  
 └ ConfigData
```

Although the MVP runs in **single-tenant mode**, the tenant concept exists to allow future multi-tenant hosting.

---

# Domain Concepts

## Tenant

Represents an organizational boundary.

For the MVP the system will operate using a **single default tenant**, but the concept exists to support future SaaS hosting.


## Project

Projects represent applications or services that require configuration.

Examples:
-   Payments API
-   Web Frontend
-   Data Pipeline


Projects act as the primary collaboration boundary.

Configuration is always scoped to a project.


## Environment

Environments represent deployment contexts within a project.

Typical environments include:

-   development
-   staging
-   production

Each environment can have independent configuration values.


## ConfigKey

A ConfigKey represents the **identity of a configuration variable**.

```bash
DATABASE_URL  
REDIS_URL  
payments/stripe/key
```

Hierarchical paths are supported as part of the key string but are not modeled as a separate structure.

ConfigKeys are unique within a project.


## ConfigValue

A ConfigValue represents the value of a ConfigKey for a specific environment.

It is uniquely defined by:

(ConfigKey, Environment)

Each ConfigValue maintains a history of revisions.


## Revision

A Revision represents an immutable version of a configuration value.

Revisions support:

-   rollback
-   version history
-   safe configuration updates

Only one revision can be active at a time.


## ConfigData (Value Object)

ConfigData represents the actual stored configuration value.

It contains the underlying value and metadata describing whether the value is secret or public.

Secret values are encrypted before being stored.


# Active Value Resolution

To retrieve configuration the system resolves:

Project  
→ ConfigKey  
→ ConfigValue (Environment)  
→ Active Revision  
→ ConfigData

Only the **active revision** is returned.


# Versioning Rules

The system enforces the following rules:

1.  Revisions are immutable once created.
2.  Each ConfigValue may have multiple revisions.
3.  Exactly one revision may be active at a time.
4.  Activating a revision does not modify previous revisions.

---

# Security Model

Configuration values can be classified as either `public` or `secret`.

Secret values are encrypted before storage using **application-level encryption**.

Encryption occurs inside the API before the value is persisted to the database.

This ensures that sensitive values cannot be read directly from storage.

---

# Configuration Key Structure

Configuration keys may optionally use hierarchical paths.

```bash
database/url  
database/pool_size  
payments/stripe/key  
payments/stripe/webhook_secret
```

The hierarchy exists purely as a naming convention and does not introduce additional domain objects.

---

# Initial System Architecture

The MVP architecture is intentionally simple.

Client  
↓  
KeyVault API (ASP.NET Core)  
↓  
PostgreSQL Database

Authentication will be handled through an external identity provider using OIDC.

----------

# Hosting Strategy

The project will be hosted early in development to validate real-world usage.

Initial deployment will consist of:

API container  
PostgreSQL database

Deployment will use Docker.

---

# MVP Feature Scope

The first version will support:

-   authentication
-   project creation
-   environment management
-   configuration key creation
-   configuration value storage
-   revision activation
-   configuration bundle retrieval

---

# Future Features

Potential future expansions include:

-   audit logs
-   service accounts
-   machine authentication
-   CLI tooling
-   runtime secret injection
-   configuration export
-   SaaS multi-tenant hosting

---

# Design Principles

KeyVault follows several core design principles.

### Simplicity First

The system will start small and evolve gradually.

### Versioned Configuration

Configuration changes must be traceable and reversible.

### Environment Isolation

Configuration values are always scoped to a specific environment.

### Immutable History

Configuration revisions cannot be modified once created.

---

# Summary

KeyVault provides a structured and secure approach to configuration management by combining:

-   project-scoped configuration keys
-   environment-specific values
-   immutable version history
-   encrypted secret storage

The initial focus is to deliver a **minimal but deployable configuration service** that can be expanded into a more comprehensive secret management platform.