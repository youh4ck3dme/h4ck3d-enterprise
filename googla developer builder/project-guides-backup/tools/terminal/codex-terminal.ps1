$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location -LiteralPath $ProjectRoot

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
    [string]$Name,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  if ($null -ne $Arguments -and $Arguments.Count -gt 0) {
    npm run $Name -- @Arguments
  }
  else {
    npm run $Name
  }

  if ($LASTEXITCODE -ne 0) {
    throw "npm run $Name failed with exit code $LASTEXITCODE."
  }
}

Assert-Command -Name "node"
Assert-Command -Name "npm"

$nodeMajor = Get-NodeMajorVersion
if ($nodeMajor -lt 22) {
  throw "Node.js v22+ is required. Current version: $((& node -v).Trim())"
}

$Host.UI.RawUI.WindowTitle = "GOOGLA Builder1s :: Codex Terminal"

function global:bootstrap {
  & (Join-Path $ProjectRoot "tools\setup\bootstrap.ps1") @args
}

function global:dev {
  Invoke-NpmScript -Name "dev" @args
}

function global:typecheck {
  Invoke-NpmScript -Name "typecheck" @args
}

function global:lint {
  Invoke-NpmScript -Name "lint" @args
}

function global:test {
  Invoke-NpmScript -Name "test" @args
}

function global:build {
  Invoke-NpmScript -Name "build" @args
}

function global:qa {
  Invoke-NpmScript -Name "typecheck"
  Invoke-NpmScript -Name "lint"
  Invoke-NpmScript -Name "test"
  Invoke-NpmScript -Name "build"
}

function global:prompt {
  $branch = ""
  try {
    $branch = (& git rev-parse --abbrev-ref HEAD 2>$null).Trim()
  }
  catch {
    $branch = ""
  }

  if ([string]::IsNullOrWhiteSpace($branch)) {
    $branch = "-"
  }

  return "gb1s[$branch] PS $($executionContext.SessionState.Path.CurrentLocation)> "
}

Write-Host ""
Write-Host "GOOGLA Builder1s dedicated terminal is ready." -ForegroundColor Green
Write-Host ("Project: {0}" -f $ProjectRoot) -ForegroundColor DarkCyan
Write-Host ("Node:    {0}" -f (& node -v).Trim()) -ForegroundColor DarkCyan
Write-Host ("npm:     {0}" -f (& npm -v).Trim()) -ForegroundColor DarkCyan
Write-Host ""
Write-Host "Commands: bootstrap, dev, typecheck, lint, test, build, qa" -ForegroundColor Yellow
