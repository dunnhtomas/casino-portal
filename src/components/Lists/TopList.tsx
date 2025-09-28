import type {RatingInput} from '../../managers/RatingManager';

export default function TopList({items}:{items:Array<any>}){
  return (
    <ol className="space-y-4">
      {items.map((it, idx)=>(
        <li key={it.slug} className="flex items-start">
          <div className="w-12 font-bold text-xl">{idx+1}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{it.brand}</h3>
            </div>
            <p className="text-sm text-gray-600">{it.topTags?.join(' • ')}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}