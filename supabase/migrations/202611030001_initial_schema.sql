-- All patient data is accessible only through validated capability-token RPCs.
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (length(btrim(full_name)) between 2 and 160),
  document_number text check (length(document_number) <= 40),
  birth_date date,
  sex text check (sex in ('female', 'male', 'other', 'prefer_not_to_say')),
  email text check (length(email) <= 254),
  phone text check (length(phone) <= 40),
  consent_accepted_at timestamptz not null
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  license_number text,
  email text,
  phone text,
  specialty text
);

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  code text not null unique check (code in ('heymans', 'chaside', 'eysenck')),
  name text not null,
  version text not null,
  item_count integer not null check (item_count > 0)
);

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  access_token uuid not null unique default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  test_id uuid not null references public.tests(id),
  test_version text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  revision integer not null default 0,
  check ((status = 'completed') = (completed_at is not null))
);

create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  attempt_id uuid not null unique references public.test_attempts(id),
  scores jsonb not null,
  interpretation jsonb not null,
  scoring_version text not null
);

create index test_attempts_patient_id_idx on public.test_attempts(patient_id);
create index test_attempts_test_id_idx on public.test_attempts(test_id);

alter table public.patients enable row level security;
alter table public.professionals enable row level security;
alter table public.tests enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_results enable row level security;

revoke all on public.patients, public.professionals, public.tests, public.test_attempts, public.test_results from public, anon, authenticated;

insert into public.tests (code, name, version, item_count) values
  ('heymans', 'Cuestionario Caracterológico de Heymans', 'forms-v1', 30),
  ('chaside', 'Test de Orientación Vocacional CHASIDE', 'forms-v1', 98),
  ('eysenck', 'Inventario de Personalidad de Eysenck', 'forms-v1', 57);

create function public.validate_answers(p_code text, p_count integer, p_answers jsonb, p_complete boolean)
returns void language plpgsql set search_path = '' as $$
declare
  v_key text;
  v_value jsonb;
  v_allowed text[];
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or octet_length(p_answers::text) > 10000 then
    raise exception 'INVALID_ANSWERS';
  end if;
  v_allowed := case when p_code = 'heymans' then array['X', 'Z'] else array['SI', 'NO'] end;
  for v_key, v_value in select * from jsonb_each(p_answers) loop
    if v_key !~ '^[1-9][0-9]{0,2}$' then raise exception 'INVALID_ITEM'; end if;
    if v_key::integer > p_count or jsonb_typeof(v_value) <> 'string' or not (v_value #>> '{}' = any(v_allowed)) then
      raise exception 'INVALID_ANSWER';
    end if;
  end loop;
  if p_complete and (select count(*) from jsonb_object_keys(p_answers)) <> p_count then
    raise exception 'INCOMPLETE_ANSWERS';
  end if;
end;
$$;

create function public.start_test(p_code text, p_version text, p_patient jsonb, p_consent boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_test public.tests%rowtype;
  v_patient_id uuid;
  v_token uuid;
  v_birth_date date;
begin
  if p_consent is distinct from true then raise exception 'CONSENT_REQUIRED'; end if;
  if p_patient is null or jsonb_typeof(p_patient) <> 'object' or octet_length(p_patient::text) > 3000 then
    raise exception 'INVALID_PATIENT';
  end if;
  if jsonb_typeof(p_patient->'full_name') is distinct from 'string'
     or length(btrim(p_patient->>'full_name')) not between 2 and 160 then raise exception 'INVALID_NAME'; end if;
  if exists (select 1 from jsonb_each(p_patient) e where e.key not in ('full_name','document_number','birth_date','sex','email','phone')
    or jsonb_typeof(e.value) not in ('string','null')) then raise exception 'INVALID_PATIENT'; end if;
  if nullif(p_patient->>'email', '') is not null and
    (length(p_patient->>'email') > 254 or p_patient->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then raise exception 'INVALID_EMAIL'; end if;
  if length(coalesce(p_patient->>'document_number','')) > 40 or length(coalesce(p_patient->>'phone','')) > 40 then raise exception 'INVALID_PATIENT'; end if;
  v_birth_date := nullif(p_patient->>'birth_date','')::date;
  if v_birth_date > current_date or v_birth_date < date '1900-01-01' then raise exception 'INVALID_BIRTH_DATE'; end if;
  select * into v_test from public.tests where code = p_code and version = p_version;
  if not found then raise exception 'UNKNOWN_TEST_VERSION'; end if;
  insert into public.patients (full_name, document_number, birth_date, sex, email, phone, consent_accepted_at)
    values (btrim(p_patient->>'full_name'), nullif(p_patient->>'document_number',''), v_birth_date,
      nullif(p_patient->>'sex',''), nullif(p_patient->>'email',''), nullif(p_patient->>'phone',''), now())
    returning id into v_patient_id;
  insert into public.test_attempts (patient_id, test_id, test_version) values (v_patient_id, v_test.id, v_test.version)
    returning access_token into v_token;
  return v_token;
end;
$$;

create function public.get_attempt(p_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'code', t.code, 'version', a.test_version, 'status', a.status, 'answers', a.answers,
    'revision', a.revision, 'started_at', a.started_at, 'completed_at', a.completed_at,
    'result', case when r.id is null then null else jsonb_build_object(
      'scores', r.scores, 'interpretation', r.interpretation, 'scoring_version', r.scoring_version) end
  ) into v_result from public.test_attempts a join public.tests t on t.id = a.test_id
    left join public.test_results r on r.attempt_id = a.id where a.access_token = p_token;
  if v_result is null then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  return v_result;
end;
$$;

create function public.save_attempt(p_token uuid, p_answers jsonb, p_revision integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_attempt public.test_attempts%rowtype; v_test public.tests%rowtype;
begin
  select * into v_attempt from public.test_attempts where access_token = p_token for update;
  if not found then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.status <> 'in_progress' then raise exception 'ATTEMPT_COMPLETED'; end if;
  if p_revision is distinct from v_attempt.revision then raise exception 'REVISION_CONFLICT'; end if;
  select * into v_test from public.tests where id = v_attempt.test_id;
  perform public.validate_answers(v_test.code, v_test.item_count, p_answers, false);
  update public.test_attempts set answers = p_answers, revision = revision + 1 where id = v_attempt.id;
  return public.get_attempt(p_token);
end;
$$;

create function public.complete_attempt(p_token uuid, p_revision integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_attempt public.test_attempts%rowtype; v_test public.tests%rowtype;
begin
  select * into v_attempt from public.test_attempts where access_token = p_token for update;
  if not found then raise exception 'ATTEMPT_NOT_FOUND'; end if;
  if v_attempt.status = 'completed' then return public.get_attempt(p_token); end if;
  if p_revision is distinct from v_attempt.revision then raise exception 'REVISION_CONFLICT'; end if;
  select * into v_test from public.tests where id = v_attempt.test_id;
  perform public.validate_answers(v_test.code, v_test.item_count, v_attempt.answers, true);
  -- TODO: replace with a versioned, professionally approved scoring key and norms.
  -- Never accept scores or clinical interpretations supplied by the browser.
  insert into public.test_results (attempt_id, scores, interpretation, scoring_version)
    values (v_attempt.id, '{}'::jsonb,
      '{"status":"pending_validation","message":"La corrección estará disponible cuando el profesional valide las claves y los baremos."}'::jsonb,
      'pending-professional-validation-v1');
  update public.test_attempts set status = 'completed', completed_at = now(), revision = revision + 1 where id = v_attempt.id;
  return public.get_attempt(p_token);
end;
$$;

revoke all on function public.validate_answers(text, integer, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.start_test(text, text, jsonb, boolean) from public;
revoke all on function public.get_attempt(uuid) from public;
revoke all on function public.save_attempt(uuid, jsonb, integer) from public;
revoke all on function public.complete_attempt(uuid, integer) from public;
grant execute on function public.start_test(text, text, jsonb, boolean) to anon, authenticated;
grant execute on function public.get_attempt(uuid) to anon, authenticated;
grant execute on function public.save_attempt(uuid, jsonb, integer) to anon, authenticated;
grant execute on function public.complete_attempt(uuid, integer) to anon, authenticated;
