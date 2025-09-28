export function shapeToplist(casinos:Array<any>, filters:{payoutMaxHours?:number, provider?:string} = {}){
  let out = casinos.slice();
  if(filters.payoutMaxHours != null){
    out = out.filter(c=> typeof c.payoutSpeedHours === 'number' && c.payoutSpeedHours <= filters.payoutMaxHours);
  }
  if(filters.provider){
    out = out.filter(c=> (c.providers||[]).includes(filters.provider));
  }
  // default: sort by payout then by brand
  out.sort((a,b)=>{
    const pa = a.payoutSpeedHours || 9999;
    const pb = b.payoutSpeedHours || 9999;
    if(pa !== pb) return pa - pb;
    return (a.brand||'').localeCompare(b.brand||'');
  });
  return out;
}