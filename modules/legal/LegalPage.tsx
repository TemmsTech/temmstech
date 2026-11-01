import { SideToc } from "@/components/side-toc";
import type { LegalDocument } from "@/types/legal";

export function LegalPage({ document }: { document: LegalDocument }) {
  const items = document.sections.map((section) => ({
    id: section.id,
    label: section.short ?? section.title,
  }));
  return (
    <>
      <section className="bg-secondary" aria-labelledby="page-title">
        <div className="page-container pt-16 pb-12 sm:pt-20 lg:pt-24">
          <div className="max-w-3xl">
            <p className="eyebrow mb-5 text-accent-foreground">LEGAL</p>
            <h1 id="page-title" className="section-title">
              {document.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {document.summary}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated {document.updated}
            </p>
          </div>
        </div>
      </section>
      <section className="bg-secondary" aria-label={`${document.title} text`}>
        <div className="page-container pb-16 sm:pb-20 lg:pb-24">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
            <SideToc items={items} />
            <div className="max-w-3xl space-y-10 lg:col-start-1 lg:row-start-1">
              {document.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="border-t border-border pt-6"
                >
                  <h2
                    id={`${section.id}-title`}
                    className="text-xl font-semibold tracking-tight"
                  >
                    {index + 1}. {section.title}
                  </h2>
                  {section.paragraphs?.map((text) => (
                    <p
                      key={text}
                      className="mt-4 text-base leading-7 text-muted-foreground"
                    >
                      {text}
                    </p>
                  ))}
                  {section.items && (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
