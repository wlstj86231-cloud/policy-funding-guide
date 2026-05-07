# 정책자금 백과 Android

정책자금 백과의 Android 전용 네이티브 앱입니다. WebView가 아니라 Kotlin과 Jetpack Compose로 구성했고, 웹사이트와 같은 정책자금 데이터 202개를 앱 내부 데이터로 동기화합니다.

## 구성

- Kotlin + Jetpack Compose
- 정책자금 검색
- 카테고리 필터
- 신청자 유형 필터
- 정책자금 상세 화면
- 신청 절차, 준비 서류, 확인 메모
- 공식 기관 링크와 웹사이트 링크

## 데이터 동기화

```powershell
node scripts/sync-policy-data.mjs
```

위 명령은 정책자금 API에서 최신 데이터를 받아 Android 모델, 저장소, 미리보기 문서를 다시 생성합니다.

## 실행

Android Studio에서 `android/` 폴더를 열고 Gradle Sync 후 실행합니다. 로컬 CLI 빌드는 Android SDK와 Gradle이 필요합니다.
