-- ============================================
-- 어린이 체크리스트 앱 - Supabase 스키마
-- Supabase SQL Editor에서 그대로 실행하세요.
-- ============================================

-- 확장 기능 (UUID 생성용)
create extension if not exists "pgcrypto";

-- ----------------------------------------------
-- 1. 앱 설정 (관리자 비밀번호 등 단일 행 테이블)
-- ----------------------------------------------
create table if not exists app_settings (
  id int primary key default 1,
  admin_password text not null default '0000',
  constraint single_row check (id = 1)
);

insert into app_settings (id, admin_password)
values (1, '0000')
on conflict (id) do nothing;

-- ----------------------------------------------
-- 2. 아이들
-- ----------------------------------------------
create table if not exists kids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text not null default '🐰',
  color text not null default '#FFB996',
  star_balance int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------
-- 3. 일과 (할 일 템플릿)
-- ----------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid references kids(id) on delete cascade, -- null이면 전체 공통 일과
  title text not null,
  icon text not null default '✅',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------
-- 4. 일별 체크 기록 (날짜 + 아이 + 일과 단위)
-- ----------------------------------------------
create table if not exists task_logs (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  log_date date not null,
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  unique (kid_id, task_id, log_date)
);

create index if not exists idx_task_logs_kid_date on task_logs (kid_id, log_date);

-- ----------------------------------------------
-- 5. 일별 보상(별) 지급 기록 - "하루 다 하면 별 1개"
-- ----------------------------------------------
create table if not exists daily_rewards (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  reward_date date not null,
  stars_awarded int not null default 1,
  created_at timestamptz not null default now(),
  unique (kid_id, reward_date)
);

-- ----------------------------------------------
-- 6. 별 지급/차감 원장 (부모 선물, 상점 구매, 일일 보상 모두 기록)
-- ----------------------------------------------
create table if not exists star_transactions (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  amount int not null, -- 양수: 적립, 음수: 차감(구매)
  reason text not null, -- 'daily_complete' | 'parent_gift' | 'shop_purchase' | 'manual_adjust'
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists idx_star_tx_kid on star_transactions (kid_id, created_at desc);

-- ----------------------------------------------
-- 7. 상점 아이템
-- ----------------------------------------------
create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '🎁',
  price int not null default 5,
  stock int, -- null = 무제한
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------
-- 8. 구매 내역
-- ----------------------------------------------
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  shop_item_id uuid references shop_items(id) on delete set null,
  item_name_snapshot text not null,
  item_icon_snapshot text not null,
  price int not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- RLS: 이 앱은 가정용 단일 그룹 앱이므로
-- anon 키로 전체 read/write를 허용합니다.
-- (외부 공개 배포 시에는 별도 인증 도입 권장)
-- ============================================
alter table app_settings enable row level security;
alter table kids enable row level security;
alter table tasks enable row level security;
alter table task_logs enable row level security;
alter table daily_rewards enable row level security;
alter table star_transactions enable row level security;
alter table shop_items enable row level security;
alter table purchases enable row level security;

create policy "allow all app_settings" on app_settings for all using (true) with check (true);
create policy "allow all kids" on kids for all using (true) with check (true);
create policy "allow all tasks" on tasks for all using (true) with check (true);
create policy "allow all task_logs" on task_logs for all using (true) with check (true);
create policy "allow all daily_rewards" on daily_rewards for all using (true) with check (true);
create policy "allow all star_transactions" on star_transactions for all using (true) with check (true);
create policy "allow all shop_items" on shop_items for all using (true) with check (true);
create policy "allow all purchases" on purchases for all using (true) with check (true);

-- ============================================
-- 샘플 데이터 (원하면 주석 해제해서 사용하세요)
-- ============================================
-- insert into kids (name, avatar, color, sort_order) values
--   ('하늘', '🐰', '#FFB996', 0),
--   ('바다', '🐻', '#A8E6CE', 1);

-- insert into tasks (title, icon, sort_order) values
--   ('이불 정리하기', '🛏️', 0),
--   ('양치하기', '🦷', 1),
--   ('숙제하기', '📚', 2),
--   ('장난감 정리하기', '🧸', 3);

-- insert into shop_items (name, icon, price, sort_order) values
--   ('초코 아이스크림', '🍦', 5, 0),
--   ('만화책 1시간', '📺', 8, 1),
--   ('장난감 자동차', '🚗', 15, 2);
