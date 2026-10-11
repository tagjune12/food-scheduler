import React from 'react';
import './PrivacyPage.scss';

const PrivacyPage = () => {
    return (
        <div className="privacy-page-container">
            <h1>개인정보처리방침 (Privacy Policy)</h1>

            <section>
                <h2>1. 수집하는 개인정보 항목 (Information We Collect)</h2>
                <p>본 서비스는 구글 로그인을 통해 사용자의 동의 하에 다음 정보를 수집하고 이용합니다.</p>
                <p className="en-section">This service collects and uses the following information with your consent via Google sign-in:</p>
                <ul>
                    <li>구글 계정 이메일 주소, 이름, 프로필 사진 및 계정 식별자 (Google account email address, name, profile picture, and account identifier)</li>
                    <li>사용자가 등록한 방문 일정: 식당, 방문 날짜 (Visit schedules you create: restaurant and visit date)</li>
                    <li>사용자가 등록한 북마크: 식당 (Bookmarks you create: restaurant)</li>
                </ul>
            </section>

            <section>
                <h2>2. 개인정보의 이용 목적 (How We Use Your Information)</h2>
                <p>수집된 정보는 오직 다음의 목적으로만 사용됩니다.</p>
                <p className="en-section">The collected information is used solely for the following purposes:</p>
                <ul>
                    <li>로그인 및 사용자 식별 (Signing in and identifying the user)</li>
                    <li>방문 일정과 북마크의 저장, 조회, 수정, 삭제 (Storing, viewing, updating, and deleting visit schedules and bookmarks)</li>
                </ul>
            </section>

            <section>
                <h2>3. 개인정보의 보유 및 파기 (Data Retention and Deletion)</h2>
                <p>수집된 정보는 클라우드 데이터베이스 서비스인 Supabase에 저장되며, 본인만 조회하고 변경할 수 있도록 보호됩니다. 방문 일정과 북마크는 사용자가 직접 삭제하거나 탈퇴를 요청할 때까지 보관하며, 탈퇴 요청 시 계정 정보와 함께 지체 없이 파기합니다.</p>
                <p className="en-section">The collected information is stored in Supabase, a cloud database service, and is protected so that only you can view and change it. Visit schedules and bookmarks are retained until you delete them or request account deletion; upon such a request, they are deleted without delay together with your account information.</p>
            </section>

            <section>
                <h2>4. 제3자 제공 및 공유 금지 (Third-Party Disclosure)</h2>
                <p>사용자의 개인정보를 외부에 제공하거나 판매하지 않습니다. 데이터 저장을 위해 Supabase를 이용하며, 수집한 정보는 서비스 기능 수행 이외의 용도로 사용되지 않습니다.</p>
                <p className="en-section">We do not provide or sell your personal information to third parties. We use Supabase to store data, and the collected information is used strictly for the service's functionality and nothing else.</p>
            </section>

            <section>
                <h2>5. 권리 철회 방법 (How to Revoke Access)</h2>
                <p>사용자는 언제든지 구글 계정 설정의 <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">보안 페이지</a>에서 본 서비스의 로그인 연결을 해제할 수 있습니다. 저장된 데이터의 삭제는 아래 문의 이메일로 요청할 수 있습니다.</p>
                <p className="en-section">You can disconnect this service from your Google account at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account Security settings</a>. To have your stored data deleted, contact us at the email below.</p>
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
