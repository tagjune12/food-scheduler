import React from 'react';
import './PrivacyPage.scss';

const PrivacyPage = () => {
    return (
        <div className="privacy-page-container">
            <h1>개인정보처리방침 (Privacy Policy)</h1>

            <section>
                <h2>1. 수집하는 개인정보 항목 (Information We Collect)</h2>
                <p>본 서비스는 구글 캘린더 API를 통해 사용자의 동의 하에 다음 정보를 수집하고 이용합니다.</p>
                <p className="en-section">This service collects and uses the following information with your consent via the Google Calendar API:</p>
                <ul>
                    <li>구글 계정 이메일 주소 (Google account email address)</li>
                    <li>구글 캘린더 일정 데이터: 제목, 시간, 장소, 설명 등 (Calendar event data: title, time, location, description, etc.)</li>
                </ul>
            </section>

            <section>
                <h2>2. 개인정보의 이용 목적 (How We Use Your Information)</h2>
                <p>수집된 정보는 오직 다음의 목적으로만 사용됩니다.</p>
                <p className="en-section">The collected information is used solely for the following purposes:</p>
                <ul>
                    <li>사용자의 기존 일정 조회 및 웹페이지 내 표시 (Viewing and displaying existing events)</li>
                    <li>사용자의 요청에 따른 일정 생성, 수정 및 삭제 (Creating, updating, and deleting events as requested by the user)</li>
                </ul>
            </section>

            <section>
                <h2>3. 개인정보의 보유 및 파기 (Data Retention and Deletion)</h2>
                <p>본 서비스는 사용자의 캘린더 데이터를 별도의 외부 서버에 저장하거나 보유하지 않습니다. 모든 데이터 처리는 API 호출 시 실시간으로 이루어지며, 브라우저 세션이 종료되거나 연동을 해제할 경우 즉시 파기됩니다.</p>
                <p className="en-section">This service does not store or retain your calendar data on any external servers. All data processing occurs in real-time via API calls and is discarded immediately when the session ends or the connection is revoked.</p>
            </section>

            <section>
                <h2>4. 제3자 제공 및 공유 금지 (Third-Party Disclosure)</h2>
                <p>사용자의 개인정보를 외부에 제공하거나 판매하지 않습니다. 구글 API를 통해 얻은 데이터는 서비스 기능 수행 이외의 용도로 사용되지 않습니다.</p>
                <p className="en-section">We do not provide or sell your personal information to third parties. Data obtained through Google APIs is used strictly for the service's functionality and nothing else.</p>
            </section>

            <section>
                <h2>5. 권리 철회 방법 (How to Revoke Access)</h2>
                <p>사용자는 언제든지 구글 계정 설정의 <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">보안 페이지</a>에서 본 서비스의 액세스 권한을 취소할 수 있습니다.</p>
                <p className="en-section">Users can revoke this service's access at any time through their <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account Security settings</a>.</p>
            </section>

            <hr />

            <section>
                <h2>6. 문의처 (Contact Us)</h2>
                <p>서비스명: 머먹지</p>
                <p>문의 이메일: tagjune12@gmail.com</p>
            </section>

            <footer>
                <p>© 2026 tagjune12. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PrivacyPage;
