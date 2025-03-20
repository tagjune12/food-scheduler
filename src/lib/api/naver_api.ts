interface NaverLocalSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: Array<{
    title: string;
    link: string;
    category: string;
    description: string;
    telephone: string;
    address: string;
    roadAddress: string;
    mapx: string;
    mapy: string;
  }>;
}

export async function searchLocalPlaces(
  query: string,
): Promise<NaverLocalSearchResponse> {
  const clientId = process.env.REACT_APP_NAVER_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('네이버 API 인증 정보가 설정되지 않았습니다.');
  }

  const response = await fetch(
    `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(
      query,
    )}&display=10&start=1&sort=random`,
    {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    },
  );

  if (!response.ok) {
    throw new Error('네이버 API 호출에 실패했습니다.');
  }

  return response.json();
}
