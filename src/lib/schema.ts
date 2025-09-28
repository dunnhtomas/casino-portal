export function generateItemListJSONLD(items:Array<any>, name = 'Top Casinos'){
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, idx)=>({
      "@type": "ListItem",
      position: idx+1,
      url: it.url,
      name: it.brand
    }))
  };
}

export function generateReviewJSONLD(review:any, siteUrl = 'https://example.com'){
  if(!review) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {"@type":"Organization","name":"BestCasinoPortal"},
    "datePublished": review.updatedAt || review.createdAt || null,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review._score || null,
      "bestRating": 10,
      "worstRating": 0
    },
    "itemReviewed": {
      "@type": "Casino",
      "name": review.brand,
      "url": review.url
    }
  };
}

export function generateFAQJSONLD(faqs:Array<{q:string,a:string}>){
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f=>({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {"@type": "Answer","text": f.a}
    }))
  };
}
