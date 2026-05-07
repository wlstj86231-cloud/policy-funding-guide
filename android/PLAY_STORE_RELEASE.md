# Play Store Release Checklist

## App

- App name: 정책자금 백과
- Package name: `com.policyfundpedia.app`
- Version: `1.0.1`
- Version code: `2`
- Minimum Android: 8.0, API 26
- Target SDK: 35

## Current Build Status

- Debug APK builds successfully.
- Release APK can be generated after signing configuration is prepared.
- App is a native Kotlin + Jetpack Compose app, not a WebView wrapper.
- The app includes 202 policy fund records synced from the same source as the website.

## Store Listing Draft

Short description:

소상공인, 창업자, 중소기업, 고용주, 비사업자를 위한 정부 정책자금 정보를 한눈에 확인하세요.

Full description:

정책자금 백과는 정부 정책자금, 창업지원금, 소상공인 대출, 고용지원금, 서민금융 정보를 빠르게 찾아볼 수 있는 정보성 앱입니다.

지원 대상, 한도, 금리, 신청 절차, 준비 서류, 공식 기관 링크를 문서별로 정리했습니다. 관심 있는 정책자금은 기기에 저장해 두고 다시 확인할 수 있습니다.

본 앱은 특정 금융상품 가입이나 대출 실행을 보장하지 않습니다. 실제 지원 조건, 금액, 마감일은 각 기관의 공식 공고를 반드시 확인해야 합니다.

## Data Safety

- Account creation: No
- Personal information collection: No
- Location collection: No
- Financial account collection: No
- User-generated content: No
- Local-only saved items: Yes, saved policy fund IDs are stored on device only

## Before Upload

1. Create a Play Console app.
2. Prepare upload signing key and keep it outside the repository.
3. Build a signed release AAB.
4. Add privacy policy URL.
5. Add screenshots from a real Android device or emulator.
