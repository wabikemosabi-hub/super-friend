alter table public.profiles drop constraint profiles_username_check;

alter table public.profiles add constraint profiles_username_check check (
  char_length(username) between 3 and 24
  and username ~ '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$'
);
