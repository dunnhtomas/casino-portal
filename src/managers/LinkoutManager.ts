export function buildOutboundLink(href:string, opts:{page?:string,id?:string,medium?:string} = {}){
  try{
    const url = new URL(href);
    url.searchParams.set('utm_source','bcp');
    url.searchParams.set('utm_medium', opts.medium || 'rankings');
    url.searchParams.set('utm_campaign', opts.page || 'sitewide');
    if(opts.id) url.searchParams.set('a', opts.id);
    return url.toString();
  }catch(e){
    return href; // fallback if invalid
  }
}