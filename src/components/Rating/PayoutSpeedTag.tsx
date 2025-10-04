interface PayoutSpeedTagProps {
  readonly hours: number;
}

export default function PayoutSpeedTag({ hours }: PayoutSpeedTagProps) {
  let label = 'Standard';
  if (hours <= 12) label = 'Very Fast (<12h)';
  else if (hours <= 24) label = 'Fast (<24h)';
  else if (hours <= 72) label = 'Average (<72h)';
  else label = 'Slow';
  
  return (
    <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
      {label}
    </span>
  );
}