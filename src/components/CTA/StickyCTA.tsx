export default function StickyCTA(){
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white p-3 rounded-full shadow-lg flex items-center gap-3">
        <div className="text-sm font-semibold">Top Offer</div>
        <button className="px-4 py-2 rounded-full bg-indigo-600 text-white">Claim</button>
      </div>
    </div>
  );
}