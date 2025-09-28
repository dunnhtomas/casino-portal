export default function OfferButton({href,label,id}:{href:string;label:string;id:string}){
  const url = new URL(href);
  url.searchParams.set('utm_source','bcp');
  url.searchParams.set('utm_medium','rankings');
  url.searchParams.set('utm_campaign','sitewide');
  url.searchParams.set('a', id);
  return (
    <a href={url.toString()} rel="nofollow sponsored" target="_blank"
       className="inline-flex items-center px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring">
      {label}
    </a>
  );
}