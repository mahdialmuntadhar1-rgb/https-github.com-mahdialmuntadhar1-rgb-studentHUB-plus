param(
  [switch]$Remote,
  [switch]$DryRun,
  [string]$DatabaseName = "rafid-db",
  [string]$ImportsDir,
  [string]$File,
  [string]$InstitutionsFile = "academic_institutions_import_ready.csv",
  [string]$ContactsFile = "academic_contacts_import_ready.csv"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir
$ConfigPath = Join-Path $BackendDir "wrangler.toml"
if (-not $ImportsDir) {
  $ImportsDir = Join-Path $BackendDir "imports"
}
if ($File) {
  $InstitutionsFile = $File
  $ContactsFile = $File
}

function Resolve-ImportPath([string]$PathOrName) {
  if ([IO.Path]::IsPathRooted($PathOrName)) {
    return $PathOrName
  }
  return Join-Path $ImportsDir $PathOrName
}

$InstitutionsCsv = Resolve-ImportPath $InstitutionsFile
$ContactsCsv = Resolve-ImportPath $ContactsFile

foreach ($file in @($InstitutionsCsv, $ContactsCsv)) {
  if ($file.ToLowerInvariant().EndsWith(".xlsx")) {
    throw "XLSX import is not supported by this PowerShell script. Open the workbook, save the relevant sheet as CSV, place it in backend/imports, then pass its filename with -InstitutionsFile or -ContactsFile."
  }
  if (-not (Test-Path -LiteralPath $file)) {
    throw "Missing import CSV: $file"
  }
}

function Sql-Literal([object]$Value) {
  if ($null -eq $Value) { return "NULL" }
  $text = ([string]$Value).Trim()
  if ($text.Length -eq 0) { return "NULL" }
  return "'" + $text.Replace("'", "''") + "'"
}

function Clean([object]$Value) {
  if ($null -eq $Value) { return "" }
  return ([string]$Value).Trim()
}

function Pick-Value($Row, [string[]]$Names) {
  foreach ($name in $Names) {
    if ($Row.PSObject.Properties.Name -contains $name) {
      $value = Clean $Row.$name
      if ($value) { return $value }
    }
  }
  return ""
}

function Normalize-Key([object]$Value) {
  $text = (Clean $Value).ToLowerInvariant()
  $text = $text -replace "[^\p{L}\p{Nd}]+", " "
  $text = $text -replace "\s+", " "
  return $text.Trim()
}

function Normalize-Website([object]$Value) {
  $text = Clean $Value
  if (-not $text) { return "" }
  $text = $text.Trim().TrimEnd("/")
  $text = $text -replace "^https?://", ""
  $text = $text -replace "^www\.", ""
  return $text.ToLowerInvariant()
}

function Normalize-Phone([object]$Value) {
  $text = Clean $Value
  if (-not $text) { return "" }
  $text = $text -replace "\.0$", ""
  $parts = $text -split "[;/,|]"
  $normalized = New-Object System.Collections.Generic.List[string]
  foreach ($part in $parts) {
    $phone = ($part -replace "[^\d+]", "")
    if ($phone.StartsWith("00")) { $phone = "+" + $phone.Substring(2) }
    if ($phone.StartsWith("0") -and $phone.Length -eq 11) { $phone = "+964" + $phone.Substring(1) }
    if ($phone -and -not $normalized.Contains($phone)) { $normalized.Add($phone) }
  }
  return ($normalized -join ";")
}

function Primary-Phone([object]$Value) {
  $phone = Normalize-Phone $Value
  if (-not $phone) { return "" }
  return (($phone -split ";") | Select-Object -First 1)
}

function Hash-Text([string]$Value) {
  $bytes = [Text.Encoding]::UTF8.GetBytes($Value)
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $hash = $sha.ComputeHash($bytes)
  } finally {
    $sha.Dispose()
  }
  return (($hash | ForEach-Object { $_.ToString("x2") }) -join "")
}

function Normalize-Governorate([object]$Value) {
  $text = Clean $Value
  if (-not $text) { return "" }
  $key = $text.ToLowerInvariant()
  $aliases = @(
    @{ keys = @("baghdad"); value = "Baghdad" },
    @{ keys = @("basra", "basrah"); value = "Basra" },
    @{ keys = @("erbil", "arbil", "hawler"); value = "Erbil" },
    @{ keys = @("sulaymaniyah", "sulaimani", "slemani"); value = "Sulaymaniyah" },
    @{ keys = @("duhok", "dohuk"); value = "Duhok" },
    @{ keys = @("halabja"); value = "Halabja" },
    @{ keys = @("nineveh", "mosul"); value = "Nineveh" },
    @{ keys = @("kirkuk"); value = "Kirkuk" },
    @{ keys = @("anbar"); value = "Anbar" },
    @{ keys = @("salahaddin", "salah al-din", "salah al din", "salah aldin"); value = "Salahaddin" },
    @{ keys = @("diyala"); value = "Diyala" },
    @{ keys = @("babil", "babylon"); value = "Babil" },
    @{ keys = @("karbala"); value = "Karbala" },
    @{ keys = @("najaf"); value = "Najaf" },
    @{ keys = @("qadisiyah", "diwaniyah"); value = "Qadisiyah" },
    @{ keys = @("wasit"); value = "Wasit" },
    @{ keys = @("dhi qar", "dhiqar", "thi qar"); value = "Dhi Qar" },
    @{ keys = @("maysan"); value = "Maysan" },
    @{ keys = @("muthanna"); value = "Muthanna" },
    @{ keys = @("all iraq", "iraq", "nationwide"); value = "All Iraq" }
  )
  foreach ($alias in $aliases) {
    foreach ($aliasKey in $alias.keys) {
      if ($key -eq $aliasKey -or $key.Contains($aliasKey)) {
        return $alias.value
      }
    }
  }
  return $text
}

function Invoke-D1Json([string]$Sql) {
  $wranglerArgs = @("wrangler", "d1", "execute", $DatabaseName, "--config", $ConfigPath)
  if ($Remote) { $wranglerArgs += "--remote" }
  $wranglerArgs += @("--command", $Sql, "--json")
  $output = & npx @wranglerArgs
  if ($LASTEXITCODE -ne 0) { throw "D1 query failed: $Sql" }
  $jsonText = @($output) -join [Environment]::NewLine
  $start = $jsonText.IndexOf("[")
  $end = $jsonText.LastIndexOf("]")
  if ($start -lt 0 -or $end -lt $start) { throw "D1 query did not return JSON." }
  return ($jsonText.Substring($start, $end - $start + 1) | ConvertFrom-Json)
}

function Invoke-D1File([string]$SqlFile) {
  $wranglerArgs = @("wrangler", "d1", "execute", $DatabaseName, "--config", $ConfigPath)
  if ($Remote) { $wranglerArgs += "--remote" }
  $wranglerArgs += @("--file", $SqlFile)
  & npx @wranglerArgs
  if ($LASTEXITCODE -ne 0) { throw "D1 import failed with exit code $LASTEXITCODE" }
}

function Get-ColumnSet([string]$TableName) {
  $result = Invoke-D1Json "PRAGMA table_info($TableName);"
  $set = @{}
  foreach ($row in @($result[0].results)) { $set[$row.name] = $true }
  return $set
}

function Has-Col($Set, [string]$Name) {
  return $Set.ContainsKey($Name)
}

function Build-Insert([string]$Table, [hashtable]$Values, $Columns) {
  $names = New-Object System.Collections.Generic.List[string]
  $vals = New-Object System.Collections.Generic.List[string]
  foreach ($name in $Values.Keys) {
    if (Has-Col $Columns $name) {
      $names.Add($name)
      $vals.Add((Sql-Literal $Values[$name]))
    }
  }
  return "INSERT INTO $Table (" + ($names -join ", ") + ") VALUES (" + ($vals -join ", ") + ");"
}

function Build-UpdateMissing([string]$Table, $ExistingRow, [hashtable]$Values, $Columns, [string[]]$AllowedFields) {
  $sets = New-Object System.Collections.Generic.List[string]
  foreach ($name in $AllowedFields) {
    if (-not (Has-Col $Columns $name)) { continue }
    $newValue = Clean $Values[$name]
    if (-not $newValue) { continue }
    $oldValue = Clean $ExistingRow.$name
    if ($oldValue) { continue }
    $sets.Add("$name = " + (Sql-Literal $newValue))
  }
  if ($sets.Count -eq 0) { return $null }
  if (Has-Col $Columns "updated_at") { $sets.Add("updated_at = CURRENT_TIMESTAMP") }
  return "UPDATE $Table SET " + ($sets -join ", ") + " WHERE id = " + (Sql-Literal $ExistingRow.id) + ";"
}

function New-InstitutionValues($Row) {
  $nameEn = Pick-Value $Row @("name_en", "Name (English)", "english_name", "nameEnglish", "nameEN")
  $nameNative = Pick-Value $Row @("name_ar_ku", "Name (Arabic / Kurdish)", "name_ar", "name_ku", "arabic_kurdish_name", "native_name", "nameOriginal")
  $governorate = Normalize-Governorate (Pick-Value $Row @("governorate", "Governorate", "gov"))
  if (-not $governorate) { $governorate = "Unknown" }
  $institutionType = Pick-Value $Row @("institution_type", "Institution Type", "type")
  if (-not $institutionType) { $institutionType = "academic" }

  return @{
    id = "academic-inst-" + ([guid]::NewGuid().ToString("N"))
    name_ar = $(if ($nameNative) { $nameNative } else { $nameEn })
    name_ku = $nameNative
    name_en = $nameEn
    governorate = $governorate
    city = Pick-Value $Row @("city", "City")
    type = $institutionType
    website = Normalize-Website (Pick-Value $Row @("website", "Website"))
    active = "1"
    is_seed = "0"
    phone = Normalize-Phone (Pick-Value $Row @("phone", "Phone"))
    email = (Pick-Value $Row @("email", "Email")).ToLowerInvariant()
    address = Pick-Value $Row @("address", "Address")
    latitude = Pick-Value $Row @("latitude", "Latitude")
    longitude = Pick-Value $Row @("longitude", "Longitude")
    status = Pick-Value $Row @("status", "Status")
    verification_label = Pick-Value $Row @("verification_label", "Verification Label")
    notes = Pick-Value $Row @("notes", "Notes / Affiliation")
  }
}

function New-ContactValues($Row) {
  $institutionName = Pick-Value $Row @("institution_name", "Name (English)", "name_en", "nameEN", "name_ar_ku", "Name (Arabic / Kurdish)", "nameOriginal")
  $email = (Pick-Value $Row @("email", "Email")).ToLowerInvariant()
  $phone = Normalize-Phone (Pick-Value $Row @("phone", "Phone"))
  $status = Pick-Value $Row @("status", "Status")
  if (-not $status) { $status = "active" }

  if (-not $email -and $phone) {
    $status = "invalid"
    $phoneInstKey = (Primary-Phone $phone) + "|" + (Normalize-Key $institutionName)
    $email = "phone-only-" + (Hash-Text $phoneInstKey).Substring(0, 24) + "@rafid.invalid"
  }

  $notes = Pick-Value $Row @("notes", "Outreach Notes", "Notes / Affiliation")
  if ($email.StartsWith("phone-only-")) {
    $notes = ("Phone-only contact; generated non-deliverable email key for schema compatibility. " + $notes).Trim()
  }

  return @{
    id = "academic-contact-" + ([guid]::NewGuid().ToString("N"))
    institution_name = $institutionName
    contact_name = Pick-Value $Row @("contact_name", "Contact Name")
    email = $email
    phone = $phone
    department = Pick-Value $Row @("department", "Department", "dept")
    governorate = Normalize-Governorate (Pick-Value $Row @("governorate", "Governorate", "gov"))
    institution_type = Pick-Value $Row @("institution_type", "Institution Type", "type")
    language = Pick-Value $Row @("language", "Language")
    source = $(if (Pick-Value $Row @("source", "Source")) { Pick-Value $Row @("source", "Source") } else { "academic_institutions_import" })
    status = $status
    notes = $notes
  }
}

function Add-ReportRow([string]$Entity, [string]$Action, [string]$Reason, [string]$ExistingId, [hashtable]$Values) {
  $script:duplicateReport.Add([pscustomobject]@{
    entity = $Entity
    action = $Action
    reason = $Reason
    existing_id = $ExistingId
    name = $(if ($Values.ContainsKey("name_en")) { $Values.name_en } elseif ($Values.ContainsKey("institution_name")) { $Values.institution_name } else { "" })
    native_name = $(if ($Values.ContainsKey("name_ar")) { $Values.name_ar } else { "" })
    governorate = $(if ($Values.ContainsKey("governorate")) { $Values.governorate } else { "" })
    website = $(if ($Values.ContainsKey("website")) { $Values.website } else { "" })
    email = $(if ($Values.ContainsKey("email")) { $Values.email } else { "" })
    phone = $(if ($Values.ContainsKey("phone")) { $Values.phone } else { "" })
  })
}

$institutionColumns = Get-ColumnSet "institutions"
$contactColumns = Get-ColumnSet "outreach_contacts"

$existingInstitutions = Invoke-D1Json "SELECT * FROM institutions;"
$existingContacts = Invoke-D1Json "SELECT * FROM outreach_contacts;"

$institutionsByWebsite = @{}
$institutionsByNameGov = @{}
$institutionsByNativeGov = @{}
foreach ($row in @($existingInstitutions[0].results)) {
  $websiteKey = Normalize-Website $row.website
  if ($websiteKey) { $institutionsByWebsite[$websiteKey] = $row }
  $nameGovKey = (Normalize-Key $row.name_en) + "|" + (Normalize-Key $row.governorate)
  if ($nameGovKey -ne "|") { $institutionsByNameGov[$nameGovKey] = $row }
  foreach ($nativeName in @($row.name_ar, $row.name_ku)) {
    $nativeGovKey = (Normalize-Key $nativeName) + "|" + (Normalize-Key $row.governorate)
    if ($nativeGovKey -ne "|") { $institutionsByNativeGov[$nativeGovKey] = $row }
  }
}

$contactsByEmail = @{}
$contactsByPhoneInst = @{}
foreach ($row in @($existingContacts[0].results)) {
  $emailKey = (Clean $row.email).ToLowerInvariant()
  if ($emailKey) { $contactsByEmail[$emailKey] = $row }
  $phoneInstKey = (Primary-Phone $row.phone) + "|" + (Normalize-Key $row.institution_name)
  if ($phoneInstKey -ne "|") { $contactsByPhoneInst[$phoneInstKey] = $row }
}

$seenInstitutionKeys = @{}
$seenContactKeys = @{}
$sql = New-Object System.Collections.Generic.List[string]
$duplicateReport = New-Object System.Collections.Generic.List[object]
$summary = [ordered]@{
  totalRowsRead = 0
  institutionsInserted = 0
  duplicateInstitutionsSkippedOrUpdated = 0
  contactsInserted = 0
  duplicateContactsSkippedOrUpdated = 0
  errors = 0
  dryRun = [bool]$DryRun
}

$institutionRows = Import-Csv -LiteralPath $InstitutionsCsv
$contactRows = Import-Csv -LiteralPath $ContactsCsv

foreach ($row in $institutionRows) {
  $summary.totalRowsRead += 1
  try {
    $values = New-InstitutionValues $row
    if (-not (Clean $values.name_en) -and -not (Clean $values.name_ar)) {
      $summary.errors += 1
      continue
    }

    $website = Normalize-Website $values.website
    $englishKey = (Normalize-Key $values.name_en) + "|" + (Normalize-Key $values.governorate)
    $nativeKey = (Normalize-Key $values.name_ar) + "|" + (Normalize-Key $values.governorate)
    $dedupeKey = if ($website) { "web:$website" } elseif ((Normalize-Key $values.name_en)) { "namegov:$englishKey" } else { "nativegov:$nativeKey" }

    if ($seenInstitutionKeys.ContainsKey($dedupeKey)) {
      $summary.duplicateInstitutionsSkippedOrUpdated += 1
      Add-ReportRow "institution" "skipped" "duplicate within import file" "" $values
      continue
    }
    $seenInstitutionKeys[$dedupeKey] = $true

    $existing = $null
    $reason = ""
    if ($website -and $institutionsByWebsite.ContainsKey($website)) {
      $existing = $institutionsByWebsite[$website]
      $reason = "matched website"
    } elseif ((Normalize-Key $values.name_en) -and $institutionsByNameGov.ContainsKey($englishKey)) {
      $existing = $institutionsByNameGov[$englishKey]
      $reason = "matched English name + governorate"
    } elseif ((Normalize-Key $values.name_ar) -and $institutionsByNativeGov.ContainsKey($nativeKey)) {
      $existing = $institutionsByNativeGov[$nativeKey]
      $reason = "matched native name + governorate"
    }

    if ($existing) {
      $statement = Build-UpdateMissing "institutions" $existing $values $institutionColumns @("name_ar", "name_ku", "name_en", "governorate", "city", "type", "website", "phone", "email", "address", "latitude", "longitude", "status", "verification_label", "notes")
      if ($statement) { $sql.Add($statement) }
      $summary.duplicateInstitutionsSkippedOrUpdated += 1
      Add-ReportRow "institution" $(if ($statement) { "update_missing" } else { "skipped" }) $reason $existing.id $values
    } else {
      $sql.Add((Build-Insert "institutions" $values $institutionColumns))
      $summary.institutionsInserted += 1
    }
  } catch {
    $summary.errors += 1
  }
}

foreach ($row in $contactRows) {
  $summary.totalRowsRead += 1
  try {
    $values = New-ContactValues $row
    $email = (Clean $values.email).ToLowerInvariant()
    $phone = Primary-Phone $values.phone
    $institutionName = Clean $values.institution_name
    if (-not $email -and -not $phone) {
      $summary.duplicateContactsSkippedOrUpdated += 1
      Add-ReportRow "contact" "skipped" "no email or phone" "" $values
      continue
    }

    $phoneInstKey = $phone + "|" + (Normalize-Key $institutionName)
    $dedupeKey = if ($email -and -not $email.StartsWith("phone-only-")) { "email:$email" } else { "phoneinst:$phoneInstKey" }
    if ($seenContactKeys.ContainsKey($dedupeKey)) {
      $summary.duplicateContactsSkippedOrUpdated += 1
      Add-ReportRow "contact" "skipped" "duplicate within import file" "" $values
      continue
    }
    $seenContactKeys[$dedupeKey] = $true

    $existing = $null
    $reason = ""
    if ($email -and $contactsByEmail.ContainsKey($email)) {
      $existing = $contactsByEmail[$email]
      $reason = "matched email"
    } elseif ($contactsByPhoneInst.ContainsKey($phoneInstKey)) {
      $existing = $contactsByPhoneInst[$phoneInstKey]
      $reason = "matched phone + institution"
    }

    if ($existing) {
      $statement = Build-UpdateMissing "outreach_contacts" $existing $values $contactColumns @("institution_name", "contact_name", "phone", "department", "governorate", "institution_type", "language", "source", "notes", "status")
      if ($statement) { $sql.Add($statement) }
      $summary.duplicateContactsSkippedOrUpdated += 1
      Add-ReportRow "contact" $(if ($statement) { "update_missing" } else { "skipped" }) $reason $existing.id $values
    } else {
      $sql.Add((Build-Insert "outreach_contacts" $values $contactColumns))
      $summary.contactsInserted += 1
    }
  } catch {
    $summary.errors += 1
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $ImportsDir "academic_import_duplicate_report_$timestamp.csv"
$duplicateReport | Export-Csv -LiteralPath $reportFile -NoTypeInformation -Encoding UTF8
$summary["duplicateReportFile"] = $reportFile
$summary["sqlStatementsGenerated"] = $sql.Count

if ($DryRun) {
  Write-Host "Dry run only. No D1 changes were written."
  [pscustomobject]$summary | ConvertTo-Json -Depth 4
  return
}

$tempSqlFile = Join-Path ([IO.Path]::GetTempPath()) ("rafid-academic-import-{0}.sql" -f ([guid]::NewGuid().ToString("N")))
$utf8NoBom = New-Object Text.UTF8Encoding $false
[IO.File]::WriteAllText($tempSqlFile, ($sql -join [Environment]::NewLine), $utf8NoBom)

try {
  Write-Host "Importing academic institutions and contacts into $DatabaseName..."
  if ($sql.Count -gt 0) {
    Invoke-D1File $tempSqlFile
  }
} finally {
  Remove-Item -LiteralPath $tempSqlFile -Force -ErrorAction SilentlyContinue
}

[pscustomobject]$summary | ConvertTo-Json -Depth 4
