create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null unique,
  subject text not null,
  description text not null,
  user_id text,
  user_department text,
  created_at timestamptz not null default now()
);

create table if not exists executions (
  id uuid primary key default gen_random_uuid(),
  ticket_ref uuid not null references tickets(id),
  status text not null,
  final_decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists decisions (
  id uuid primary key default gen_random_uuid(),
  execution_ref uuid not null references executions(id),
  ticket_id text not null,
  decision text not null,
  confidence double precision not null,
  response text not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists decision_sources (
  id uuid primary key default gen_random_uuid(),
  decision_ref uuid not null references decisions(id),
  source_id text not null
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  execution_ref uuid not null references executions(id),
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists errors (
  id uuid primary key default gen_random_uuid(),
  execution_ref uuid not null references executions(id),
  message text not null,
  created_at timestamptz not null default now()
);
