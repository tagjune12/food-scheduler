import { access_token } from '@src/App';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export async function getUserInfo(): Promise<GoogleUserInfo> {
  if (!access_token) {
    throw new Error('액세스 토큰이 없습니다.');
  }

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    throw error;
  }
} 