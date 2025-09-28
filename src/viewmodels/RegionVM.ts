export function getRegionData(regions:Array<any>, casinos:Array<any>, regionId:string){
  const region = regions.find(r=> r.id === regionId);
  const local = casinos.filter(c=> (c.restrictedGeos||[]).indexOf(regionId.toUpperCase()) === -1);
  return {
    region,
    casinos: local
  };
}