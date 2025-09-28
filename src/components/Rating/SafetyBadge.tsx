export default function SafetyBadge({score}:{score:number}){
  const label = score >= 8.5 ? 'Very Safe' : score >=7 ? 'Safe' : 'Questionable';
  const color = score >= 8.5 ? 'bg-green-600' : score >=7 ? 'bg-yellow-500' : 'bg-red-500';
  return <span className={`inline-flex items-center px-2 py-1 text-white rounded-full ${color} text-xs`}>{label}</span>;
}