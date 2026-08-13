param(
  [string]$ApiOrigin = 'https://api.timetable.lol'
)

$ErrorActionPreference = 'Stop'
$apiBaseUrl = $ApiOrigin.TrimEnd('/')
$eventsEndpoint = "$apiBaseUrl/api/events"
$response = Invoke-RestMethod -Uri $eventsEndpoint

if (-not $response.events -or $response.events.Count -eq 0) {
  throw 'The Timetable.lol events endpoint returned no events.'
}

function Get-EventSlug([string]$slug) {
  return $slug.Trim() -replace '\.html$', ''
}

function Get-EventLocation($event, [string]$verifiedAt) {
  $location = $event.location
  $parts = @($location.name, $location.city, $location.country | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })

  if ($parts.Count -eq 0) {
    return $null
  }

  return [ordered]@{
    displayName = $parts -join ', '
    venue = [string]$location.name
    city = [string]$location.city
    region = [string]$location.region
    country = [string]$location.country
    address = [string]$location.address
    precision = if ($location.name) { 'venue' } else { 'city' }
    source = 'Timetable.lol API'
    verifiedAt = $verifiedAt
  }
}

function Get-SafeUrl([string]$value) {
  $url = $null

  if ([Uri]::TryCreate($value, [UriKind]::Absolute, [ref]$url) -and $url.Scheme -in @('http', 'https')) {
    return $url.AbsoluteUri
  }

  return ''
}

function Get-PlannerSets($plannerData, [string]$eventSlug, [string]$sourceUrl) {
  $sets = @()
  $skippedRows = 0
  $days = $plannerData.data

  foreach ($dayProperty in $days.PSObject.Properties) {
    $dayName = $dayProperty.Name
    $day = $dayProperty.Value
    $date = [string]$plannerData.festivalRange.$dayName.date

    if (-not $date -or $date -notmatch '^\d{4}-\d{2}-\d{2}$') {
      $skippedRows += @($day.stages.PSObject.Properties.Value | ForEach-Object { $_.Count } | Measure-Object -Sum).Sum
      continue
    }

    foreach ($stageProperty in $day.stages.PSObject.Properties) {
      $stage = [string]$stageProperty.Name
      $rowIndex = 0

      foreach ($row in $stageProperty.Value) {
        $rowIndex += 1
        $match = [regex]::Match([string]$row, '^(?<sourceId>\S+)\s+(?<start>\d{1,2}:\d{2})\s+(?<end>\d{1,2}:\d{2})\s+(?<artist>.+)$')

        if (-not $match.Success) {
          $skippedRows += 1
          continue
        }

        $artist = $match.Groups['artist'].Value.Trim()

        if (-not $artist) {
          $skippedRows += 1
          continue
        }

        $sets += [ordered]@{
          performanceId = "$eventSlug`:$date`:$stage`:$($match.Groups['sourceId'].Value):$rowIndex"
          artist = $artist
          day = $date
          startTime = ('{0:00}:{1}' -f [int]$match.Groups['start'].Value.Split(':')[0], $match.Groups['start'].Value.Split(':')[1])
          endTime = ('{0:00}:{1}' -f [int]$match.Groups['end'].Value.Split(':')[0], $match.Groups['end'].Value.Split(':')[1])
          stage = $stage.Trim()
        }
      }
    }
  }

  return [PSCustomObject]@{ Sets = @($sets); SkippedRows = $skippedRows }
}

$catalogueEvents = @()
$skippedEvents = @()

foreach ($event in $response.events) {
  if ([string]$event.status -ne 'live') {
    continue
  }

  $eventSlug = Get-EventSlug([string]$event.slug)

  if (-not $eventSlug) {
    $skippedEvents += 'A live event without a slug'
    continue
  }

  $plannerEndpoint = "$apiBaseUrl/api/events/$eventSlug/planner-data"

  try {
    $plannerData = Invoke-RestMethod -Uri $plannerEndpoint
    $plannerSets = Get-PlannerSets $plannerData $eventSlug $plannerEndpoint

    if ($plannerSets.Sets.Count -eq 0) {
      $skippedEvents += "$eventSlug (no importable timed sets)"
      continue
    }

    $verifiedAt = if ($event.updatedAt) { [string]$event.updatedAt } else { [string]$response.updatedAt }
    $catalogueEvents += [ordered]@{
      eventSlug = $eventSlug
      title = [string]$event.title
      startDate = [string]$event.startDate
      endDate = [string]$event.endDate
      sourceUrl = $plannerEndpoint
      updatedAt = [string]$plannerData.updatedAt
      timeZone = [string]$plannerData.timeZone
      location = Get-EventLocation $event $verifiedAt
      imageUrl = Get-SafeUrl ([string]$event.imageUrl)
      tickets = [ordered]@{
        ticketUrl = Get-SafeUrl ([string]$event.ticketUrl)
        resaleTicketUrl = Get-SafeUrl ([string]$event.resaleTicketUrl)
        price = [string]$event.ticketPrice
        currency = [string]$event.ticketPriceCurrency
      }
      sets = $plannerSets.Sets
      skippedRows = $plannerSets.SkippedRows
    }
  } catch {
    $skippedEvents += "$eventSlug ($($_.Exception.Message))"
  }
}

if ($catalogueEvents.Count -eq 0) {
  throw 'No live Timetable.lol events contained importable timed sets. The existing catalogue was not changed.'
}

$asset = [ordered]@{
  source = $eventsEndpoint
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  events = $catalogueEvents
}
$outputDirectory = Join-Path $PSScriptRoot '..\src\assets\timetables'
$outputPath = Join-Path $outputDirectory 'timetable-lol-catalogue.json'

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$asset | ConvertTo-Json -Depth 8 -Compress | Set-Content -LiteralPath $outputPath -NoNewline -Encoding utf8

Write-Output "Updated $outputPath with $($catalogueEvents.Count) live events and $(($catalogueEvents | ForEach-Object { $_.sets.Count } | Measure-Object -Sum).Sum) timed sets."

if ($skippedEvents.Count -gt 0) {
  Write-Warning "Skipped $($skippedEvents.Count) live events: $($skippedEvents -join '; ')"
}

$skippedRows = (@($catalogueEvents.skippedRows) | Measure-Object -Sum).Sum
if ($skippedRows -gt 0) {
  Write-Warning "Skipped $skippedRows untimed or malformed planner rows."
}
