export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pageNo = url.searchParams.get('pageNo') || '1';
    const numOfRows = url.searchParams.get('numOfRows') || '15';
    
    // 공공데이터포털 중기부 사업공고 API 호출
    const apiUrl = `http://apis.data.go.kr/1371000/mssPblancService/getPblancList?serviceKey=${env.BIZINFO_API_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&type=json`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // CORS 허용
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }
};