-- Reasons are scoped to (author, recipient). The update policy only checks
-- the author, so without this an author could move a reason to any user,
-- including strangers. Authors may only edit the wording.
revoke update on public.reasons from authenticated;
grant update (text) on public.reasons to authenticated;
