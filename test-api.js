const apiKey = 'AIzaSyCwVps974x7xrlSkA8_M9RcChSAdfdqUj4';
const searchId = '017576662512468014348:omuauf_lfve';
const query = 'SpellWin casino logo';

const params = new URLSearchParams({
  key: apiKey,
  cx: searchId,
  q: query,
  searchType: 'image',
  num: '3'
});

fetch(`https://www.googleapis.com/customsearch/v1?${params}`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log('❌ API Error:', data.error.message);
      console.log('Need to create custom search engine at: https://cse.google.com/cse/');
    } else {
      console.log('✅ API Working! Found', data.items?.length || 0, 'results');
      if (data.items) {
        console.log('Sample result:', data.items[0]?.link);
      }
    }
  })
  .catch(err => console.log('❌ Error:', err.message));