(function(){
  function send(payload){
    try{
      if(navigator.sendBeacon){
        navigator.sendBeacon('/api/perf', JSON.stringify(payload));
      }else{
        fetch('/api/perf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{});
      }
    }catch(e){console.warn('perf send failed', e)}
  }

  function gather(){
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const paints = performance.getEntriesByType('paint').reduce((acc,entry)=>{ acc[entry.name]=entry.startTime; return acc; },{});
    let lcp = 0; let cls = 0;
    try{
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if(lcpEntries && lcpEntries.length) lcp = lcpEntries[lcpEntries.length-1].startTime;
      const clsEntries = performance.getEntriesByType('layout-shift');
      cls = clsEntries.reduce((s,e)=> s + (e.value||0), 0);
    }catch(e){}
    const payload = {
      url: location.pathname + location.search,
      ttfb: nav.responseStart || 0,
      fcp: paints['first-contentful-paint'] || 0,
      lcp: lcp,
      cls: cls,
      timestamp: Date.now()
    };
    send(payload);
  }

  if(document.readyState === 'complete') setTimeout(gather, 2000);
  else window.addEventListener('load', ()=> setTimeout(gather, 1000));
})();
