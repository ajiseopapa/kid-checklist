-- ============================================
-- 마이그레이션: 주간 목표 + 주간 보상 별 기능 추가
-- 이미 운영 중인 Supabase 프로젝트라면
-- SQL Editor에서 이 파일만 실행하면 돼요.
-- ============================================

-- 1. app_settings에 주간 보너스 별 개수 컬럼 추가 (기본값 5)
alter table app_settings
  add column if not exists weekly_bonus_stars int not null default 5;

-- 2. 주간 보상 지급 기록 테이블 (중복 지급 방지용)
create table if not exists weekly_rewards (
  id uuid primary key default gen_random_uuid(),
  kid_id uuid not null references kids(id) on delete cascade,
  week_start date not null, -- 그 주 월요일 날짜
  stars_awarded int not null default 5,
  created_at timestamptz not null default now(),
  unique (kid_id, week_start)
);

alter table weekly_rewards enable row level security;

drop policy if exists "allow all weekly_rewards" on weekly_rewards;
create policy "allow all weekly_rewards" on weekly_rewards for all using (true) with check (true);
