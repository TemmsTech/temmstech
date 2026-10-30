import type { Project } from "@/types/project";
import { cn } from "@/lib/utils";

export function ProjectPreview({ kind }: { kind: Project["kind"] }) {
  return (
    <div
      aria-hidden="true"
      className={cn("project-preview", `preview-${kind}`)}
    >
      {kind === "commerce" ? (
        <div className="mock-store">
          <div className="mock-nav">
            <strong>
              form<span> & </span>field
            </strong>
            <span>Objects for the everyday</span>
          </div>
          <div className="mock-shop-body">
            <div>
              <p className="mock-kicker">CONSIDERED ESSENTIALS</p>
              <p className="mock-headline">
                Less, but
                <br />
                better.
              </p>
              <span className="mock-action">Explore the collection ↗</span>
            </div>
            <div className="mock-vase">
              <div />
            </div>
          </div>
          <div className="mock-bottom">
            <span>Thoughtful objects.</span>
            <span>Made for your space.</span>
          </div>
        </div>
      ) : kind === "education" ? (
        <div className="mock-learning">
          <div className="mock-nav">
            <strong>○ openroom</strong>
            <span>Your learning space</span>
          </div>
          <div className="mock-learning-content">
            <p className="mock-kicker">A LITTLE PROGRESS, EVERY DAY</p>
            <p className="mock-headline">
              What will you
              <br />
              learn next?
            </p>
            <div className="mock-course">
              <span className="mock-course-icon">Aa</span>
              <div>
                <strong>Design fundamentals</strong>
                <span>Continue exploring →</span>
              </div>
            </div>
            <div className="mock-course small">
              <span className="mock-course-icon">⌘</span>
              <div>
                <strong>Ideas into interfaces</strong>
                <span>Start a new chapter →</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mock-operations">
          <div className="mock-nav">
            <strong>▦ orbit</strong>
            <span>Workspace / Overview</span>
          </div>
          <div className="mock-board">
            <p className="mock-headline">A little more organised.</p>
            <div className="mock-columns">
              {["To explore", "In progress", "Ready"].map((label, index) => (
                <div key={label}>
                  <span className="mock-kicker">{label}</span>
                  {[0, 1].map((row) => (
                    <div className="mock-task" key={row}>
                      <span className="mock-line" />
                      <span className="mock-line short" />
                      <span className={`mock-dot dot-${index}`} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
