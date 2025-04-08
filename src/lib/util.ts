function getNumTypeToday(): { year: number; month: number; date: number } {
  const today: Date = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  return { year, month, date };
}

function getStringDate({
  year,
  month,
  date,
}: {
  year: number;
  month: number;
  date: number;
}): string {
  return `${year.toString()}-${month.toString().padStart(2, '0')}-${date
    .toString()
    .padStart(2, '0')}`;
}

// 토큰 저장 함수
function saveToken(token: string, expiresIn: number): void {
  const expiryTime = new Date().getTime() + expiresIn * 1000;
  localStorage.setItem('access_token', token);
  localStorage.setItem('token_expiry', expiryTime.toString());
}

// 토큰 유효성 검사 함수
function isTokenValid(): boolean {
  const expiryTime = localStorage.getItem('token_expiry');
  if (!expiryTime) return false;
  
  const now = new Date().getTime();
  return now < parseInt(expiryTime);
}

// 저장된 토큰 가져오기 함수
function getStoredToken(): string | null {
  if (!isTokenValid()) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
    return null;
  }
  
  return localStorage.getItem('access_token');
}

export { getNumTypeToday, getStringDate, saveToken, isTokenValid, getStoredToken };
