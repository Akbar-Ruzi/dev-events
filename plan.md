# Auth Feature: Existing Issues

Issues found while reviewing the uncommitted `feature/auth` changes.

## High priority: fix before merging

- [ ] **1. PATCH accepts any field**
  - **Where:** `app/api/events/[slug]/route.ts:154`
  - **Problem:** the request body goes straight into `$set`, so an owner can change any field, including `createdBy` and `slug`. Handing events to another user also gets around the 2-event limit.
  - **Also:** `findOneAndUpdate` skips the pre-save hook, so `date` and `time` aren't normalized and the slug isn't regenerated when the title changes.
  - **Fix:** accept only a fixed list of editable fields, then load the document, apply the changes and call `save()`.

- [ ] **2. Older events can't be edited or deleted**
  - **Where:** `app/api/events/[slug]/route.ts:129`
  - **Problem:** events created before this change have no `createdBy`, so `event.createdBy.toString()` throws. PATCH and DELETE return a 500, even for admins.
  - **Fix:** handle a missing `createdBy` with `event.createdBy?.toString()`, and backfill `createdBy` on existing events. Check whether the database has any such events first.

## Medium priority

- [ ] **3. Auth forms can get stuck**
  - **Where:** `components/auth/SignInForm.tsx:21`, `components/auth/SignUpForm.tsx:22`
  - **Problem:** neither request is wrapped in `try/catch`. A network error, or a non-JSON response on sign-up, leaves the button disabled and the loading toast spinning.
  - **Fix:** add `try/catch/finally`, show an error toast and reset `isSubmitting` in `finally`.

- [ ] **4. Create Event page isn't protected**
  - **Where:** `app/events/create/page.tsx`
  - **Problem:** signed-out users can open the page and fill in the whole form, and only get a 401 when they submit. There is no `middleware` or `proxy` file either.
  - **Fix:** redirect signed-out users to `/auth/sign-in`, using the same `Suspense` pattern as the auth pages.

- [ ] **5. Simultaneous signups return a 500**
  - **Where:** `app/api/auth/signup/route.ts`
  - **Problem:** the `findOne` check and `create` are separate steps. If two requests use the same email, the second hits a duplicate key error and returns a 500 instead of a 409.
  - **Fix:** catch error code `11000` and return the same 409 response.

- [ ] **6. The 2-event limit can be exceeded**
  - **Where:** `app/api/events/route.ts:29`
  - **Problem:** the count check and the create are separate steps, so parallel requests can all pass the check.
  - **Fix:** make the check atomic, for example with a per-user event counter updated by a conditional `$inc`.

## Low priority

- [ ] **7. Duplicate email index**
  - **Where:** `database/user.model.ts:30` and `database/user.model.ts:52`
  - **Problem:** the index is declared by both `unique: true` and `UserSchema.index()`, so Mongoose warns about it.
  - **Fix:** remove the `UserSchema.index()` line.

- [ ] **8. Password limit counts characters, not bytes**
  - **Where:** `app/api/auth/signup/route.ts:47`
  - **Problem:** bcrypt uses only the first 72 bytes, but the check counts characters. Part of a long non-ASCII password can be silently ignored.
  - **Fix:** check `Buffer.byteLength(password, "utf8")` instead.

- [ ] **9. ESLint errors in unchanged lines**
  - **Where:** `app/page.tsx:13`, `components/LightRays.tsx:90`, `components/LightRays.tsx:95`
  - **Problem:** an unescaped `'` and two uses of `any`. `npx eslint` fails until these are fixed.
  - **Fix:** escape the apostrophe and replace `any` with proper types.

## Not checked yet

- [ ] Run `next build`.
- [ ] Test in a browser: sign up, sign in, sign out, create an event, the 2-event limit, and edit/delete as owner, non-owner and admin.
