param(
  [string]$SourceUrl = 'https://timetable.lol/data/artist-act-index.json?v=20260710-artist-bookings-refresh'
)

$response = Invoke-WebRequest -Uri $SourceUrl -UseBasicParsing
$source = $response.Content | ConvertFrom-Json
$acts = [ordered]@{}

foreach ($property in $source.actsBySetKey.PSObject.Properties) {
  $act = $property.Value
  $acts[$property.Name] = [ordered]@{
    eventSlug = $act.eventSlug
    eventTitle = $act.eventTitle
    eventDate = $act.eventDate
    label = $act.label
    start = $act.start
    end = $act.end
    stage = $act.stage
  }
}

$asset = [ordered]@{
  source = $SourceUrl
  generatedAt = $source.generatedAt
  actsBySetKey = $acts
}
$outputDirectory = Join-Path $PSScriptRoot '..\src\assets\timetables'
$outputPath = Join-Path $outputDirectory 'timetable-lol-artist-act-index.json'

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$asset | ConvertTo-Json -Depth 5 -Compress | Set-Content -LiteralPath $outputPath -NoNewline -Encoding utf8

$parsed = Get-Content -LiteralPath $outputPath -Raw | ConvertFrom-Json

if (@($parsed.actsBySetKey.PSObject.Properties).Count -eq 0) {
  throw 'The generated Timetable.lol asset contains no timetable acts.'
}

Write-Output "Updated $outputPath with $(@($parsed.actsBySetKey.PSObject.Properties).Count) acts."
