# 정책자금 백과 Android

`policyfundpedia.com`을 단순 WebView로 감싼 앱이 아니라, Android 전용 네이티브 UI로 다시 구성한 앱입니다.

## 구성

- Kotlin + Jetpack Compose
- WebView 미사용
- 홈 대시보드
- 정책자금 검색
- 카테고리 필터
- 신청자 유형 필터
- 정책자금 상세 화면
- 신청 순서, 준비 서류, 체크 메모
- 공식 기관 링크 및 사이트 링크

## 실행 방법

1. Android Studio에서 이 `android/` 폴더를 엽니다.
2. Gradle Sync를 실행합니다.
3. Android 8.0 이상 기기 또는 에뮬레이터에서 실행합니다.

## 앱 방향

첫 버전은 빠른 탐색성과 신뢰감을 우선합니다. 작은 화면에서 금액, 금리, 대상, 준비서류를 먼저 보게 하고, 자세한 조건은 상세 화면에서 확인하도록 설계했습니다.

추후 고도화 후보:

- 즐겨찾기 저장
- 마감 임박 알림
- Cloudflare Workers API 연동
- 정책자금 추천 진단
- Play Store용 서명/릴리즈 빌드 설정
