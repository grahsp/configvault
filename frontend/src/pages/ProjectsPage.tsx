export function ProjectsPage() {
  return (
    <main className="projects-page projects-page--top">
      <section className="projects-card">
        <div className="projects-card__header">
          <div>
            <h1>Projects</h1>
          </div>
        </div>

        <p className="projects-card__copy">
          This page will list the user&apos;s available projects, project information,
          navigation into each project, and actions such as creating a new project.
        </p>

        <div className="projects-card__placeholder" aria-hidden="true" />
      </section>
    </main>
  )
}
