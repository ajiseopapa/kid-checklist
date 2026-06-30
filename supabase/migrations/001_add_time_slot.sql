-- ============================================
-- 마이그레이션: 일과에 시간대(아침/점심/저녁) 추가
-- 이미 Supabase 프로젝트를 운영 중이라면
-- SQL Editor에서 이 파일만 실행하면 돼요.
-- (schema.sql을 새로 실행할 필요 없어요!)
-- ============================================

alter table tasks
  add column if not exists time_slot text not null default 'anytime';

-- 혹시 모를 잘못된 값 방지용 체크 (선택사항)
alter table tasks
  drop constraint if exists tasks_time_slot_check;

alter table tasks
  add constraint tasks_time_slot_check
  check (time_slot in ('morning', 'afternoon', 'evening', 'anytime'));
