import { useEffect } from 'react';

interface FAQItem {
  readonly q: string;
  readonly a: string;
}

interface FAQProps {
  readonly items: readonly FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  useEffect(() => {
    // Handle aria-expanded after hydration to prevent mismatch
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const summary = item.querySelector('summary');
      if (summary) {
        // Set initial state
        summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
        
        // Update on toggle
        item.addEventListener('toggle', () => {
          summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
        });
      }
    });
  }, []);

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
