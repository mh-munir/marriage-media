# Resend email setup for admin verification

The admin OTP, superadmin email/password update, and admin creation flows are
already implemented. OTP delivery uses Resend through `src/lib/email.ts`.
No application functions or conditions need to be changed to enable delivery.

## 1. Configure a verified sender in Resend

1. Create or sign in to your Resend account.
2. Add a domain you own in **Domains**.
3. Add the DNS records Resend provides (including SPF and DKIM), then wait
   until Resend marks the domain as verified.
4. Choose a sender address on that verified domain, for example:
   `Marriage Media <no-reply@halalbiye.com>`.

Do not use an address on a domain you do not control. Until your sending domain
is verified, Resend may restrict delivery to the account owner's address.

## 2. Set environment variables

Add these server-side environment variables:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | A Resend API key with permission to send email |
| `RESEND_FROM_EMAIL` | `Marriage Media <no-reply@halalbiye.com>` (after verifying `halalbiye.com` in Resend) |

For local development, put them in `.env.local`. For Vercel, add both under
**Project → Settings → Environment Variables** for the **Production**
environment (and Preview too, if you test OTPs on preview deployments). Never
use a `NEXT_PUBLIC_` prefix for these values. After changing Vercel variables,
redeploy so the deployment receives them.

Keep the API key private. Do not commit it, put it in client-side code, or send
it in chat.

## 3. Use the admin flows

1. Sign in with the existing superadmin account.
2. Open **Admin users**.
3. Under **Superadmin details**, choose the new email and/or password, press
   **Send OTP**, and enter the code delivered to the current superadmin email.
   The code expires after 10 minutes. A code is required when changing either
   the superadmin email or password.
4. To add an admin, use **Create admin account**. The new account receives the
   `admin` role; it does not become a superadmin.

Email verification codes are limited to three sends per account per hour. In
production the OTP is delivered by email and is not returned to the browser.

If you cannot sign in to the existing superadmin, the admin page cannot reset
that account without an OTP. Use the recovery script from a trusted local
terminal. First authenticate and link the Vercel CLI to the correct project,
then pull its Production environment:

```powershell
npx vercel login
npx vercel link
npx vercel env pull .env.production.local --environment production
```

Confirm that the linked Vercel project is the intended production project.
Then run the following in the same PowerShell terminal. Enter the requested
email when prompted and the password using the hidden secure prompt:

```powershell
$env:ADMIN_EMAIL = "shohagdidar3@gmail.com"
$securePassword = Read-Host "New superadmin password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  node --env-file=.env.production.local scripts/reset-superadmin.js
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
  Remove-Variable securePassword -ErrorAction SilentlyContinue
}
```

The recovery script uses `MONGODB_URI` from the pulled Production environment,
requires exactly one existing superadmin, refuses to overwrite another
account's email, and changes only the existing superadmin's email/password.
It also re-enables that superadmin account. If it reports zero or multiple
superadmins, stop and inspect the intended production database before making
any manual changes. Do not commit `.env.production.local` or share it.

After a successful reset, sign in at the deployed site's `/admin` page with the
new credentials. You can later change the superadmin email or password from
**Admin users → Superadmin details**; that flow requires an OTP sent to the
current email, so first ensure Resend email delivery works.

### Local development using the same database

If local development and Vercel Production use the same MongoDB database, you
can instead load `.env.local` and run the same recovery script. This updates
the shared account, so the new credentials apply to both environments. Use a
new, unique password that has not been exposed in screenshots, chat, or logs:

```powershell
.\scripts\reset-superadmin-local.ps1
```

Run this only after independently confirming that `.env.local` points to the
intended shared database. The helper uses `.env.local` explicitly, asks for the
email and a hidden password prompt, and prints a clear failure if reset does
not succeed. After the success message, use the exact email and password just
entered to sign in to both local and Production.

## 4. Troubleshooting

- **“Email provider is not configured.”** Confirm both environment variables
  are present in the deployment environment, then redeploy.
- **Resend rejects the message.** Check the Resend API key, sender address, and
  verified domain; inspect the Resend email logs for delivery details.
- **No email arrives.** Check spam/quarantine and the recipient inbox's filters,
  then verify the sending domain's DNS status in Resend.
- **“Too many verification attempts.”** Wait until the hourly limit resets
  before requesting another code.
- **Database connection error.** Confirm the deployment's `MONGODB_URI` points
  to the database containing the superadmin account and that MongoDB permits
  connections from the Vercel deployment.
