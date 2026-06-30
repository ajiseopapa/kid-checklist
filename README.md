# 🌈 오늘도 잘했어요! — 어린이 체크리스트

파스텔 동물 친구들과 함께하는 귀여운 어린이 일일 체크리스트 앱이에요.
Next.js + Supabase로 만들었고, Vercel에 바로 배포할 수 있어요.

## ✨ 기능

- **체크리스트**: 아이별로 오늘의 할 일을 체크. 모든 일과를 다 하면 ⭐ 별 1개 자동 지급 + 컨페티 축하 🎉
- **선물 상점**: 모은 별로 등록된 선물을 구매 (재고 관리 지원)
- **통계 모드**: 최근 14일 달성률 그래프, 연속 완료일(스트릭), 완벽한 날 수, 일과별 누적 현황
- **부모님 모드** (비밀번호로 진입)
  - 아이 등록 / 수정 / 삭제 (이름, 아바타, 색상)
  - 아이에게 별 직접 선물하기 (이유 메모 가능)
  - 일과 등록 / 수정 / 삭제 (전체 공통 또는 특정 아이 전용 설정 가능)
  - 선물 상점 아이템 등록 / 수정 / 삭제 (가격, 재고 설정)
  - 데이터 내보내기(JSON 백업) / 불러오기(복원)
  - 관리자 비밀번호 변경

## 🧱 기술 스택

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + 클라이언트 SDK) — 데이터 저장
- Vercel — 배포
- canvas-confetti — 축하 효과

## 🚀 시작하기

### 1. Supabase 프로젝트 준비

1. supabase.com 에서 새 프로젝트를 만들어요.
2. 프로젝트의 **SQL Editor**를 열고 `supabase/schema.sql` 파일 내용을 그대로 복사해서 실행해요.
   - 테이블, 보안 정책(RLS), 기본 관리자 비밀번호(`0000`)까지 한 번에 설정돼요.
3. **Project Settings → API** 메뉴에서 아래 두 값을 복사해둬요.
   - `Project URL`
   - `anon public` key

### 2. 환경변수 설정

`.env.local.example` 파일을 복사해서 `.env.local`로 만들고 값을 채워주세요.

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속!

### 4. Vercel 배포

1. 이 프로젝트를 GitHub 저장소로 올려요.
2. vercel.com 에서 New Project → 저장소 선택.
3. **Environment Variables**에 `.env.local`과 동일한 두 값(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)을 등록해요.
4. Deploy 클릭!

## 🔑 기본 관리자 비밀번호

처음 설치하면 비밀번호는 `0000` 이에요.
앱을 켜고 화면 맨 아래 **🔐 부모님 모드** → 비밀번호 입력 → **비밀번호** 탭에서 바로 바꿔주세요.

## 💾 백업 / 복원

부모님 모드 → **백업** 탭에서:
- **내보내기**: 모든 데이터(아이, 일과, 별 기록, 상점, 구매내역)를 JSON 파일로 다운로드
- **불러오기**: 백업 파일을 선택하면 현재 데이터를 완전히 덮어써서 복원 (되돌릴 수 없으니 확인 모달이 한 번 더 떠요)

기기를 바꾸거나 Supabase 프로젝트를 새로 만들었을 때 유용해요.

## 📁 폴더 구조

```
app/
  page.tsx              메인 페이지 (아이 선택 + 체크리스트/상점/통계 전환)
  layout.tsx, globals.css
components/
  KidPicker.tsx          아이 선택 화면
  KidHeader.tsx          상단 네비게이션
  ChecklistView.tsx      체크리스트
  ShopView.tsx           선물 상점
  StatsView.tsx          통계
  confetti.ts            축하 효과
  admin/
    AdminLoginModal.tsx  비밀번호 입력
    AdminPanel.tsx       관리자 모드 전체 패널
    KidsManager.tsx      아이 관리
    GiftStars.tsx        별 선물하기
    TasksManager.tsx     일과 관리
    ShopManager.tsx      상점 관리
    DataManager.tsx      백업/복원
    PasswordChanger.tsx  비밀번호 변경
lib/
  types.ts               타입 + 상수
  stats.ts                통계 계산
  data-transfer.ts        내보내기/불러오기
  hooks/useAppData.ts     데이터 로딩 + 핵심 로직(체크, 별 지급, 구매)
  actions/admin.ts        비밀번호 검증/변경 (서버 액션)
  supabase/client.ts       Supabase 브라우저 클라이언트
supabase/schema.sql         DB 스키마 (SQL Editor에서 실행)
```

## ⚠️ 참고

- 이 앱은 가정용 단일 그룹 앱을 가정해서 Supabase RLS를 anon 키로 전체 read/write 허용하도록 설정했어요. 외부에 공개 배포할 계획이라면 별도 인증(Supabase Auth 등)을 추가하는 걸 권장해요.
- 일과는 "전체 공통"으로 등록하거나 "특정 아이 전용"으로 등록할 수 있어요. 별 지급은 그 아이에게 해당하는 활성 일과를 모두 체크했을 때 이뤄져요.
