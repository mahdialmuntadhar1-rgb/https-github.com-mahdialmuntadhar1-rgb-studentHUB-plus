async function test() {
  try {
    let all = [];
    let offset = 0;
    let limit = 200;
    let hasMore = true;
    while (hasMore) {
      const url = `https://rafid-api.mahdialmuntadhar1.workers.dev/api/institutions?limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      const json = await res.json();
      const list = json.institutions || [];
      all = all.concat(list);
      const pag = json.pagination || {};
      offset += list.length;
      hasMore = pag.hasMore && list.length > 0 && all.length < pag.total;
    }
    const govs = {};
    for (let item of all) {
      const g = item.governorate;
      govs[g] = (govs[g] || 0) + 1;
    }
    console.log('Unique governorate values in DB:', govs);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
