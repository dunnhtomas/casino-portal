interface FAQItem {
  readonly q: string;
  readonly a: string;
}

interface FAQProps {
  readonly items: readonly FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  return (
    <section aria-labelledby="faq-heading" className="mt-8">
      <h2 id="faq-heading" className="sr-only">Frequently asked questions</h2>
      <div className="space-y-4">
        {items.map((f: FAQItem, i: number) => (
          <details key={`faq-${i}`} className="faq-item">
            <summary>{f.q}</summary>
            <div className="faq-answer">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
