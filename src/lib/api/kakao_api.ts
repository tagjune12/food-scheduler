interface PlacesSearchResult {
  documents: kakao.maps.services.PlacesSearchResult[];
}

export async function searchLocalPlaces(
  query: string,
): Promise<PlacesSearchResult> {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/category.json?${query}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_MAP_API_REST_KEY}`,
        },
      },
    );

    return response.json();
  } catch (error) {
    console.error('식당정보를 불러오는데 실패하였습니다.', error);
    throw error;
  }
}
