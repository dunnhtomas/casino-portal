export default function CasinoTable({rows}:{rows:Array<any>}){
  return (
    <table className="min-w-full text-sm">
      <caption className="sr-only">Casino comparison table</caption>
      <thead>
        <tr>
          <th>Brand</th>
          <th>Payout</th>
          <th>Bonus</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r=> (
          <tr key={r.slug}>
            <td>{r.brand}</td>
            <td>{r.payoutSpeedHours ? `${r.payoutSpeedHours}h` : '—'}</td>
            <td>{r.bonuses?.welcome?.headline || '—'}</td>
            <td><a href={r.url} rel="nofollow sponsored" target="_blank">Play</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}