# policyfund-api

`policyfundpedia.com/*`를 담당하는 Worker의 재현 가능한 운영 소스입니다.

- `policyfund-live-baseline.js`는 2026-09-04 운영 버전 `8e297ad4-bf00-43db-8323-010d7156d49a`에서 추출한 불변 기준선입니다.
- 기준선 SHA-256: `D611BED41D88BBF5605337FEFAEE72461A0AD80BCB0C37C98E7E98E5B475B6D7`
- `index.js`는 정확히 `/api/bizinfo`만 새 모듈로 보내고 나머지 요청은 기준선에 위임합니다.
- 운영 비밀 `BIZINFO_API_KEY`는 Cloudflare secret binding으로만 주입합니다. 파일이나 Git에는 저장하지 않습니다.

검증은 `npm test`와 `npm run check`로 수행합니다. 배포 전에는 현재 운영 D1 바인딩과 route가 바뀌지 않았는지 readback하고, 새 버전을 preview에서 검사한 뒤 점진적으로 전환합니다.
