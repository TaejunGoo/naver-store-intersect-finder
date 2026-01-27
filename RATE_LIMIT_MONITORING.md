# Rate Limiting 모니터링 가이드

Rate limiting이 실제 운영 환경에서 제대로 동작하는지 확인하는 방법들을 설명합니다.

## 📊 모니터링 방법 (난이도 순)

### 1. UI에서 확인 (가장 쉬움) ⭐

앱 UI에 실시간 rate limit 정보가 표시됩니다.

**위치**: 검색 폼 바로 아래

**표시 정보**:
- 남은 요청 횟수 (프로그레스 바)
- 전체 허용 횟수
- 리셋까지 남은 시간

**상태별 표시**:
```
정상 (7회 이상 남음):
  [=====>    ] 7/10  ⏰ 45초 후 초기화

경고 (3회 이하 남음):
  🟠 남은 검색 횟수: 2회 / 10회  ⏰ 30초 후 초기화

제한 (0회 남음):
  🔴 검색 제한에 도달했습니다  ⏰ 15초 후 초기화
```

### 2. 브라우저 개발자 도구 (간단) ⭐⭐

**방법**:
1. F12 키를 눌러 개발자 도구 열기
2. **Network** 탭 선택
3. 검색 실행
4. `/api/search` 요청 클릭
5. **Headers** 섹션에서 **Response Headers** 확인

**확인할 헤더**:
```
X-RateLimit-Limit: 10         # 최대 허용 횟수
X-RateLimit-Remaining: 7      # 남은 횟수
X-RateLimit-Reset: 1706198400 # 리셋 시각 (Unix timestamp)
```

**Rate Limited (429) 시 추가 헤더**:
```
Retry-After: 45  # 재시도 가능까지 초
```

### 3. 테스트 스크립트 실행 (자동화) ⭐⭐⭐

개발 서버나 프로덕션 환경에서 자동으로 여러 요청을 보내 rate limiting을 테스트합니다.

**로컬 개발 환경 테스트**:
```bash
# 1. 개발 서버 시작
npm run dev

# 2. 다른 터미널에서 테스트 실행
npm run test:rate-limit
```

**프로덕션 환경 테스트**:
```bash
# package.json에서 URL 수정 후
npm run test:rate-limit:prod

# 또는 직접 URL 지정
node scripts/test-rate-limit.js https://your-app.vercel.app 15
```

**결과 예시**:
```
🚀 Rate Limit Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target: http://localhost:3000
Requests: 15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Request 1: SUCCESS (245ms)
   Rate Limit: 9/10 remaining | Reset: 오후 2:45:30

✅ Request 2: SUCCESS (198ms)
   Rate Limit: 8/10 remaining | Reset: 오후 2:45:30

...

✅ Request 10: SUCCESS (203ms)
   Rate Limit: 0/10 remaining | Reset: 오후 2:45:30

❌ Request 11: RATE LIMITED (52ms)
   Rate Limit: 0/10 remaining | Reset: 오후 2:45:30
   Retry After: 42 seconds

❌ Request 12: RATE LIMITED (48ms)
   Rate Limit: 0/10 remaining | Reset: 오후 2:45:30
   Retry After: 41 seconds
```

### 4. Upstash 대시보드 (프로덕션) ⭐⭐⭐⭐

**Upstash가 설정된 경우에만 가능**

**접속**:
1. https://console.upstash.com/ 로그인
2. Redis 데이터베이스 선택
3. **Analytics** 탭 클릭

**확인할 지표**:
- **Total Commands**: 총 Redis 명령 수
- **Commands/Second**: 초당 명령 수
- **Storage Usage**: 메모리 사용량
- **Top Commands**: 가장 많이 사용된 명령어

**Rate Limiting 패턴**:
```
일반적인 패턴:
  - GET, SET 명령이 대부분
  - naver-store-finder:* 키 패턴
  - 급격한 증가는 공격 가능성

공격 패턴:
  - 짧은 시간에 수천 개 명령
  - 동일 IP에서 반복 요청
  - Commands/Second가 비정상적으로 높음
```

### 5. Vercel 로그 (프로덕션) ⭐⭐⭐⭐⭐

**접속**:
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Logs** 탭 클릭
4. 필터: `[Rate Limit]` 검색

**로그 예시**:
```
[Rate Limit] Blocked request {
  clientId: "192.168.1.100",
  remaining: 0,
  resetTime: "2024-01-27T14:45:30.000Z",
  path: "/api/search"
}
```

**로그 분석**:
- 반복되는 IP 주소 → 봇 또는 악의적 사용자
- 짧은 시간에 여러 로그 → DDoS 시도 가능성
- 특정 시간대 집중 → 사용 패턴 분석

## 🧪 시나리오별 테스트

### 시나리오 1: 정상 사용자

**테스트**:
```bash
# 5회 검색 (제한 이하)
node scripts/test-rate-limit.js http://localhost:3000 5
```

**예상 결과**:
- ✅ 모든 요청 성공 (200 OK)
- Rate Limit: 5/10 → 0/10
- 에러 없음

### 시나리오 2: 제한 도달

**테스트**:
```bash
# 15회 검색 (제한 초과)
node scripts/test-rate-limit.js http://localhost:3000 15
```

**예상 결과**:
- ✅ 1~10번 요청: 성공 (200 OK)
- ❌ 11~15번 요청: 거부 (429 Too Many Requests)
- Retry-After 헤더 포함

### 시나리오 3: 리셋 후 재시도

**테스트**:
```bash
# 1. 제한까지 사용
node scripts/test-rate-limit.js http://localhost:3000 10

# 2. 60초 대기
sleep 60

# 3. 다시 시도 (성공해야 함)
node scripts/test-rate-limit.js http://localhost:3000 5
```

**예상 결과**:
- 리셋 후 다시 10회 허용
- 모든 요청 성공

### 시나리오 4: 다른 IP에서 동시 접속

**테스트**:
```bash
# 터미널 1 (IP: 192.168.1.100)
node scripts/test-rate-limit.js http://localhost:3000 10

# 터미널 2 (IP: 192.168.1.101 - VPN 또는 다른 네트워크)
node scripts/test-rate-limit.js http://localhost:3000 10
```

**예상 결과**:
- 각 IP별로 독립적인 10회 허용
- 서로 영향 없음

## 📈 프로덕션 모니터링 체크리스트

### 배포 직후 (첫 24시간)

- [ ] Vercel 로그에서 `[Rate Limit]` 검색
- [ ] Upstash 대시보드에서 Commands/Second 확인
- [ ] 실제 사용자 피드백 확인 (429 에러 보고)
- [ ] UI에서 rate limit 인디케이터 정상 표시 확인

### 일일 모니터링

- [ ] Upstash 무료 티어 사용량 확인 (10,000 commands/day)
- [ ] Vercel Functions 실행 시간 확인
- [ ] 에러율 확인 (429 비율)

### 주간 모니터링

- [ ] Rate limit 제한 설정 검토 (10회/분이 적절한지)
- [ ] Upstash 비용 확인 (무료 티어 초과 시)
- [ ] 반복적으로 차단된 IP 분석

## 🔧 트러블슈팅

### Rate limiting이 동작하지 않는 것 같아요

**확인 사항**:
1. Upstash 환경 변수가 Vercel에 설정되었는지
2. `X-RateLimit-*` 헤더가 응답에 포함되는지
3. Upstash 데이터베이스가 활성 상태인지
4. 로컬에서는 in-memory fallback 사용 (제한적)

**해결 방법**:
```bash
# 1. 환경 변수 확인
vercel env ls

# 2. 테스트 스크립트로 확인
npm run test:rate-limit

# 3. Upstash 로그 확인
# Upstash 대시보드 → Data Browser
```

### 429 에러가 너무 자주 발생해요

**원인**:
- 제한이 너무 엄격 (10회/분)
- 동일 IP에서 여러 사용자 접속 (회사, 학교)
- 실제 봇 공격

**해결 방법**:
```typescript
// proxy.ts에서 제한 완화
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 20,      // 10 → 20으로 증가
  WINDOW_SECONDS: 60,
}
```

### Upstash 무료 티어를 초과했어요

**현재 사용량 확인**:
```
Upstash 대시보드 → Analytics → Daily Stats
```

**해결 방법**:
1. **캐시 TTL 증가**: API 캐시를 5분 → 10분으로 늘려 Redis 사용 감소
2. **제한 강화**: MAX_REQUESTS를 10 → 5로 줄여 악의적 사용 차단
3. **Pro 플랜 고려**: 월 $10로 1M commands/day

## 📊 대시보드 만들기 (선택사항)

운영 환경에서 실시간 모니터링이 필요하다면 간단한 대시보드를 만들 수 있습니다.

**필요한 정보**:
- 현재 rate limit 상태 (Upstash)
- 시간별 요청 수 (Vercel Analytics)
- 차단된 IP 목록
- 평균 응답 시간

**구현 옵션**:
1. **Vercel Analytics**: 기본 제공 (이미 설치됨)
2. **Upstash Analytics**: 대시보드에서 확인
3. **Custom Dashboard**: `/api/stats` 엔드포인트 추가

## 🎯 요약

| 방법 | 난이도 | 실시간 | 프로덕션 필수 |
|------|--------|--------|---------------|
| UI 인디케이터 | ⭐ | ✅ | ❌ |
| 개발자 도구 | ⭐⭐ | ✅ | ❌ |
| 테스트 스크립트 | ⭐⭐⭐ | ✅ | ✅ |
| Upstash 대시보드 | ⭐⭐⭐⭐ | ✅ | ✅ |
| Vercel 로그 | ⭐⭐⭐⭐⭐ | ✅ | ✅ |

**추천 조합**:
- **개발**: UI 인디케이터 + 테스트 스크립트
- **프로덕션**: Upstash 대시보드 + Vercel 로그
