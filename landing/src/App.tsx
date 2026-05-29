import {
  ArrowRightIcon,
  BlocksIcon,
  Code2Icon,
  ExternalLinkIcon,
  FileKey2Icon,
  GitBranchIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
} from 'lucide-react'
import appScreenshot from '@/assets/configvault-app-screenshot.png'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const capabilities = [
  {
    title: 'Environment Management',
    description:
      'Manage development, staging, and production values separately within each project.',
    icon: GitBranchIcon,
  },
  {
    title: 'Encryption at Rest',
    description:
      'Secret values are encrypted before storage using project-specific data keys.',
    icon: LockKeyholeIcon,
  },
  {
    title: 'Project Collaboration',
    description:
      'Invite team members and manage role-based access within each project workspace.',
    icon: UsersRoundIcon,
  },
  {
    title: 'Import and Export',
    description:
      'Import existing configuration and export environment values when needed.',
    icon: FileKey2Icon,
  },
] as const

const architectureGroups = [
  {
    title: 'Architecture',
    description:
        'Domain-Driven Design and CQRS-inspired architecture separating domain rules, application workflows, API endpoints, and infrastructure concerns.',
    icon: BlocksIcon,
  },
  {
    title: 'Security',
    description:
      'Envelope encryption with project-scoped data keys protects secret values before they are persisted.',
    icon: LockKeyholeIcon,
  },
  {
    title: 'Identity and Access',
    description:
      'Auth0 authentication combined with project roles and capability-based authorization controls access to resources.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Collaboration',
    description:
      'Projects support environments, invitations, revision history, and shared configuration workflows.',
    icon: UsersRoundIcon,
  },
] as const

type TechnicalDecision = {
  after?: string
  content: readonly string[]
  list?: readonly string[]
  title: string
}

const technicalDecisions: readonly TechnicalDecision[] = [
  {
    title: 'Why build ConfigVault?',
    content: [
      'ConfigVault started as a way to explore secure configuration management in a full-stack application. The goal was not to compete with established products such as Vault or Doppler, but to better understand the architectural challenges involved in handling sensitive configuration data.',
      'The project focuses on topics such as authentication, authorization, encryption, collaborative workflows, and multi-environment configuration management. By implementing these concerns together, the application became a practical environment for exploring production-style software design.',
    ],
  },
  {
    title: 'Why use a layered architecture?',
    content: [
      'The application separates responsibilities between API, Application, Domain, and Infrastructure layers.',
      'This structure keeps business rules independent from delivery mechanisms and infrastructure concerns. API endpoints remain thin, application workflows coordinate use cases, domain objects enforce business rules, and infrastructure implementations handle persistence and external services.',
      'The separation improves maintainability, testability, and makes it easier to evolve individual parts of the system over time.',
    ],
  },
  {
    title: 'Why Domain-Driven Design?',
    content: [
        'ConfigVault uses Domain-Driven Design principles to model the core concepts of the system rather than treating them as simple database records.',
        'Projects, members, invitations, environments, and secrets are represented as domain concepts with their own behaviors, invariants, and access rules. Business rules are enforced within the domain model, helping prevent invalid states and keeping decision-making close to the concepts it affects.',
        'This approach provided a useful way to explore aggregate boundaries, encapsulation of business rules, value objects, and separation between domain logic and infrastructure concerns.',
        'While ConfigVault is not large enough to require every DDD pattern, the project served as a practical exercise in designing software around a domain model rather than around persistence.'
    ]
  },
  {
    title: 'Why CQRS?',
    content: [
      'Commands and queries are handled through separate request models and handlers.',
      'The primary motivation was not performance, but separation of concerns. Write operations focus on enforcing business rules through the domain model, while read operations can be optimized around the data actually required by the user interface.',
      'This works particularly well alongside Domain-Driven Design. Commands operate on aggregates and enforce invariants, while queries can project data directly into lightweight view models without loading or exposing the entire domain model.',
      'For example, listing projects or secrets often requires only a subset of information, whereas updates must execute through the domain model to ensure authorization rules and business constraints are respected.',
      'The result is a clearer separation between application workflows, domain behavior, and presentation concerns while maintaining flexibility in how data is retrieved and displayed.'
    ],
  },
  {
    title: 'How are secrets protected?',
    content: [
      'Secret values are encrypted before being persisted.',
      'ConfigVault uses an envelope encryption approach where each project owns encrypted data keys that are used to encrypt individual secret values. This separates long-term master key management from application data and allows encryption concerns to remain centralized.',
      'Secrets remain masked in the user interface and are only revealed through explicit user actions.',
    ],
  },
  {
    title: 'How does authentication and authorization work?',
    content: [
      'Authentication is delegated to Auth0 using OpenID Connect and JWT access tokens.',
      'Within ConfigVault, project access is controlled through memberships, roles, and capabilities. Users authenticate through an external identity provider, while authorization decisions remain application-specific.',
      'This separation allows identity management to stay external while business rules remain under application control.',
    ],
  },
  {
    title: 'What would be built next?',
    content: [
      'Several areas remain intentionally unfinished and would be the next focus of development:',
    ],
    list: [
      'Secret revision history and auditing',
      'Service accounts and machine-to-machine access',
      'CLI tooling for automated workflows',
      'Secret rotation support',
      'CI/CD integrations',
      'Additional import and export formats',
    ],
    after:
      'These features would move the project closer to real-world configuration management workflows while continuing to explore security and operational concerns.',
  },
] as const

function App() {
  const applicationUrl = import.meta.env.VITE_APPLICATION_URL
  const repositoryUrl = import.meta.env.VITE_REPOSITORY_URL
  const linkedinUrl = import.meta.env.VITE_LINKEDIN_URL
  const githubUrl = import.meta.env.VITE_GITHUB_URL

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <a className="inline-flex items-center gap-3 font-heading text-sm font-semibold" href="/">
          <span className="text-xl font-extrabold uppercase tracking-[0.08em] text-foreground">ConfigVault</span>
        </a>
        <nav aria-label="Project links" className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <a href="#architecture">Architecture</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={repositoryUrl} target="_blank">
              <Code2Icon data-icon="inline-start" />
              GitHub Repository
            </a>
          </Button>
        </nav>
      </header>

      <section className="relative isolate mx-auto grid w-full max-w-7xl overflow-hidden px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:min-h-[660px] lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] lg:items-center lg:px-10 lg:pb-24 lg:pt-18">
        <div className="relative z-10 flex max-w-lg flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1 className="font-semibold leading-[0.98] uppercase tracking-normal text-balance sm:text-5xl lg:text-6xl">
              ConfigVault
            </h1>
            <p className="max-w-[34rem] text-base leading-8 text-muted-foreground sm:text-lg">
              Secure configuration and secrets management for small teams, built as a
              personal full-stack engineering project.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={applicationUrl}>
                View Application
                <ArrowRightIcon data-icon="inline-end" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={repositoryUrl}>
                <Code2Icon data-icon="inline-end" />
                View Source
              </a>
            </Button>
          </div>

        </div>

        <figure
          className="relative z-0 mt-10 min-w-0 lg:pointer-events-none lg:absolute lg:-right-80 lg:top-20 lg:mt-0 lg:w-[66rem] lg:scale-105 lg:[mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_82%,transparent_100%),linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)] lg:[mask-composite:intersect] xl:-right-96 xl:w-[74rem]"
          id="application"
        >
          <div className="overflow-hidden rounded-lg border bg-card shadow-[0_32px_90px_oklch(0.1_0.02_250_/_0.18)] lg:opacity-85">
            <img
              alt="ConfigVault project secrets screen showing environment-scoped secret values"
              className="block w-full"
              height="900"
              src={appScreenshot}
              width="1440"
            />
          </div>
          <figcaption className="mt-3 text-sm text-muted-foreground lg:sr-only">
            Application workspace for project-scoped secrets and environment values.
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 mt-14 sm:px-8 lg:px-10 lg:py-18">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ title, description, icon: Icon }) => (
            <article
              className="rounded-lg border bg-card p-5 shadow-[0_10px_30px_oklch(0.1_0.02_250_/_0.05)]"
              key={title}
            >
              <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </div>
              <h3 className="font-heading text-base font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-10 lg:py-18"
        id="architecture"
      >
        <div className="max-w-xl">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <BlocksIcon aria-hidden="true" className="size-4" />
            <span>Project Overview</span>
          </div>
          <h2 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">
            Built as a production-style full-stack application.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The project focuses on the challenges of secure configuration management,
            including authentication, authorization, encryption, and multi-environment workflows.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {architectureGroups.map(({ title, description, icon: Icon }) => (
            <article className="rounded-lg border bg-card p-5" key={title}>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <h3 className="font-heading text-base font-semibold">{title}</h3>
              </div>
              <p className="mt-5 pt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-18">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">
            Design Decisions
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Explore the reasoning behind the architecture, security model, and design tradeoffs used throughout the project.
          </p>
        </div>
        <Accordion className="rounded-lg bg-card" collapsible defaultValue="why-build" type="single">
          {technicalDecisions.map(({ title, content, list, after }, index) => (
            <AccordionItem key={title} value={index === 0 ? 'why-build' : title}>
              <AccordionTrigger className="px-5 py-4 text-base font-semibold hover:no-underline sm:px-6">
                {title}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-6 text-sm leading-7 text-muted-foreground sm:px-6">
                {content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {list ? (
                  <ul className="mt-4 grid gap-2">
                    {list.map((item) => (
                      <li className="flex gap-3" key={item}>
                        <span aria-hidden="true" className="mt-[0.7em] size-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {after ? <p className="mt-4">{after}</p> : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-5 pb-8 pt-10 sm:px-8 lg:px-10">
        <Separator className="mb-6" />
        <div className="flex flex-col gap-5 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>ConfigVault — a personal engineering project by Pontus Grähs.</p>
          <nav aria-label="Footer links" className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a className="inline-flex items-center gap-1 hover:text-foreground" href={githubUrl} target="_blank">
              GitHub
              <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
            </a>
            <a className="inline-flex items-center gap-1 hover:text-foreground" href={linkedinUrl} target="_blank">
              LinkedIn
              <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
            </a>
          </nav>
        </div>
      </footer>
    </main>
  )
}

export default App
