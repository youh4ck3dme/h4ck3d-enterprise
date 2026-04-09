[CmdletBinding()]
param(
  [switch]$SkipInstall,
  [switch]$RunChecks,
  [switch]$RunLint
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location -LiteralPath $ProjectRoot

function Write-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Message
  )

  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-Command {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

function Get-NodeMajorVersion {
  $rawVersion = (& node -v).Trim()
  if ($rawVersion -notmatch "^v(\d+)\.") {
    throw "Unable to parse Node.js version '$rawVersion'."
  }

  return [int]$Matches[1]
}

function Invoke-NpmScript {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  Write-Step "npm run $Name"
  npm run $Name
  if ($LASTEXITCODE -ne 0) {
    throw "npm run $Name failed with exit code $LASTEXITCODE."
  }
}

Write-Step "Project root: $ProjectRoot"

Write-Step "Checking required tooling"
Assert-Command -Name "node"
Assert-Command -Name "npm"

$nodeMajor = Get-NodeMajorVersion
if ($nodeMajor -lt 22) {
  throw "Node.js v22+ is required. Current version: $((& node -v).Trim())"
}

Write-Host ("Node.js: {0}" -f (& node -v).Trim()) -ForegroundColor Green
Write-Host ("npm:     {0}" -f (& npm -v).Trim()) -ForegroundColor Green

if (-not $SkipInstall) {
  Write-Step "Installing dependencies (npm ci)"
  npm ci
  if ($LASTEXITCODE -ne 0) {
    throw "npm ci failed with exit code $LASTEXITCODE."
  }
}
else {
  Write-Step "Skipping dependency installation (-SkipInstall)"
}

if ($RunChecks) {
  Invoke-NpmScript -Name "typecheck"
  Invoke-NpmScript -Name "test"
  Invoke-NpmScript -Name "build"

  if ($RunLint) {
    Invoke-NpmScript -Name "lint"
  }
}

Write-Step "Environment bootstrap completed."
