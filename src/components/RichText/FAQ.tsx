export default function FAQ({items}:{items:Array<{q:string,a:string}>}){
  return (
    <section aria-labelledby="faq-heading" className="mt-8">
      <h2 id="faq-heading" className="text-xl font-semibold">Frequently asked questions</h2>
      <div className="mt-4 space-y-3">
        {items.map((f, i)=> (
          <details key={i} className="bg-gray-50 rounded-md p-3">
            <summary className="font-medium cursor-pointer">{f.q}</summary>
            <div className="mt-2 text-sm text-gray-700">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
