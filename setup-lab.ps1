[CmdletBinding()]
param(
  [string]$LabPath = "",
  [string]$SiteUrl = "http://localhost:8090",
  [string]$SiteTitle = "Atomic Lab",
  [string]$AdminUser = "admin",
  [string]$AdminEmail = "admin@example.local",
  [switch]$ResetVolumes
)

$ErrorActionPreference = "Stop"

$RepoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
if ([string]::IsNullOrWhiteSpace($LabPath)) {
  $LabPath = Join-Path $RepoRoot "experiments\atomic-wordpress-lab"
}
$script:ComposeProjectName = $env:COMPOSE_PROJECT_NAME

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "=== $Message ==="
}

function Invoke-Compose {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$ComposeArgs)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & docker compose --project-name $script:ComposeProjectName -f (Join-Path $LabPath "docker-compose.yml") --project-directory $LabPath @ComposeArgs 2>&1 | ForEach-Object { Write-Host $_ }
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($exitCode -ne 0) {
    throw "docker compose failed: $($ComposeArgs -join ' ')"
  }
}

function Invoke-WpCli {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$WpArgs)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & docker compose --project-name $script:ComposeProjectName -f (Join-Path $LabPath "docker-compose.yml") --project-directory $LabPath run --rm wpcli @WpArgs 2>&1 | ForEach-Object { Write-Host $_ }
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($exitCode -ne 0) {
    throw "wp-cli failed: $($WpArgs -join ' ')"
  }
}

function Wait-ForDocker {
  Write-Step "Checking Docker daemon"

  $dockerCliDir = Join-Path $env:ProgramFiles "Docker\Docker\resources\bin"
  if ((-not (Get-Command docker -ErrorAction SilentlyContinue)) -and (Test-Path (Join-Path $dockerCliDir "docker.exe"))) {
    $env:Path = "$dockerCliDir;$env:Path"
    Write-Host "Added Docker Desktop CLI to PATH for this shell."
  }

  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker CLI was not found on PATH. Start Docker Desktop or add Docker CLI to PATH."
  }

  for ($i = 1; $i -le 24; $i++) {
    & docker info *> $null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Docker daemon is running."
      return
    }

    if ($i -eq 1) {
      $dockerDesktop = Join-Path $env:ProgramFiles "Docker\Docker\Docker Desktop.exe"
      if (Test-Path $dockerDesktop) {
        Write-Host "Docker daemon is not ready. Trying to start Docker Desktop..."
        Start-Process -FilePath $dockerDesktop | Out-Null
      }
    }

    Start-Sleep -Seconds 5
  }

  throw "Docker daemon did not become ready within 120 seconds."
}

function Resolve-ComposeProjectName {
  if (-not [string]::IsNullOrWhiteSpace($script:ComposeProjectName)) {
    Write-Host "Using COMPOSE_PROJECT_NAME=$script:ComposeProjectName"
    return
  }

  $existingProject = ""
  $inspectJson = & docker inspect atomic-lab-mysql 2>$null
  if ($LASTEXITCODE -eq 0 -and $inspectJson) {
    $inspect = $inspectJson | ConvertFrom-Json
    $existingProject = $inspect[0].Config.Labels."com.docker.compose.project"
  }
  if (-not [string]::IsNullOrWhiteSpace($existingProject)) {
    $script:ComposeProjectName = $existingProject.Trim()
    Write-Host "Adopting existing Atomic Lab compose project: $script:ComposeProjectName"
    Adopt-ExistingMysqlEnv
    return
  }

  $script:ComposeProjectName = "atomic-lab"
  Write-Host "Using new Atomic Lab compose project: $script:ComposeProjectName"
}

function Adopt-ExistingMysqlEnv {
  $inspectJson = & docker inspect atomic-lab-mysql 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $inspectJson) {
    return
  }

  $inspect = $inspectJson | ConvertFrom-Json
  $envLines = $inspect[0].Config.Env
  $existing = @{}
  foreach ($line in $envLines) {
    $parts = "$line".Split("=", 2)
    if ($parts.Length -eq 2) {
      $existing[$parts[0]] = $parts[1]
    }
  }

  if ($existing.ContainsKey("MYSQL_PASSWORD") -and $env:ATOMIC_LAB_MYSQL_PASSWORD -eq "change-me-local-only") {
    $env:ATOMIC_LAB_MYSQL_PASSWORD = $existing["MYSQL_PASSWORD"]
    Write-Host "Adopted existing local MySQL password from running lab metadata. Value is not printed."
  }

  if ($existing.ContainsKey("MYSQL_ROOT_PASSWORD") -and $env:ATOMIC_LAB_MYSQL_ROOT_PASSWORD -eq "change-me-local-only") {
    $env:ATOMIC_LAB_MYSQL_ROOT_PASSWORD = $existing["MYSQL_ROOT_PASSWORD"]
    Write-Host "Adopted existing local MySQL root password from running lab metadata. Value is not printed."
  }
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$Attempts = 30,
    [int]$DelaySeconds = 4
  )

  for ($i = 1; $i -le $Attempts; $i++) {
    $statusCode = $null
    if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
      $curlStatus = & curl.exe -s -o NUL -w "%{http_code}" --max-redirs 0 --connect-timeout 5 $Url
      if ($LASTEXITCODE -eq 0 -and $curlStatus -match "^\d{3}$") {
        $statusCode = [int]$curlStatus
      }
    } else {
      try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
        $statusCode = [int]$response.StatusCode
      } catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
          $statusCode = [int]$_.Exception.Response.StatusCode
        }
      }
    }

    if ($statusCode -and $statusCode -ge 200 -and $statusCode -lt 500) {
      Write-Host "HTTP ready: $Url ($statusCode)"
      return
    }

    if ($i -eq $Attempts) {
      if ($statusCode) {
        throw "HTTP endpoint did not become ready: $Url (last status $statusCode)"
      } else {
        throw "HTTP endpoint did not become ready: $Url"
      }
    }

    Start-Sleep -Seconds $DelaySeconds
  }
}

function Ensure-LabPath {
  if (-not (Test-Path $LabPath)) {
    throw "Lab path does not exist: $LabPath"
  }

  $composeFile = Join-Path $LabPath "docker-compose.yml"
  if (-not (Test-Path $composeFile)) {
    throw "docker-compose.yml was not found at: $composeFile"
  }

  New-Item -ItemType Directory -Force -Path (Join-Path $LabPath "wp-content\uploads") | Out-Null
}

function Ensure-LocalEnv {
  if (-not $env:ATOMIC_LAB_WP_ADMIN_PASSWORD) {
    $env:ATOMIC_LAB_WP_ADMIN_PASSWORD = "change-me-local-only"
    Write-Host "ATOMIC_LAB_WP_ADMIN_PASSWORD was not set. Using local-only default. Do not use this for production."
  }

  if (-not $env:ATOMIC_LAB_MYSQL_PASSWORD) {
    $env:ATOMIC_LAB_MYSQL_PASSWORD = "change-me-local-only"
  }

  if (-not $env:ATOMIC_LAB_MYSQL_ROOT_PASSWORD) {
    $env:ATOMIC_LAB_MYSQL_ROOT_PASSWORD = "change-me-local-only"
  }
}

function Initialize-WordPress {
  Write-Step "Initializing WordPress"

  $installed = $false
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & docker compose --project-name $script:ComposeProjectName -f (Join-Path $LabPath "docker-compose.yml") --project-directory $LabPath run --rm wpcli core is-installed 2>&1 | Out-Null
  $isInstalledExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($isInstalledExitCode -eq 0) {
    $installed = $true
  }

  if (-not $installed) {
    Invoke-WpCli core install `
      "--url=$SiteUrl" `
      "--title=$SiteTitle" `
      "--admin_user=$AdminUser" `
      "--admin_password=$env:ATOMIC_LAB_WP_ADMIN_PASSWORD" `
      "--admin_email=$AdminEmail" `
      --skip-email
    Write-Host "WordPress core installed."
  } else {
    Write-Host "WordPress core is already installed."
  }

  Invoke-WpCli option update siteurl $SiteUrl
  Invoke-WpCli option update home $SiteUrl
  Invoke-WpCli theme activate atomic-lab
  Invoke-WpCli rewrite flush --hard
}

function Clear-DefaultContent {
  Write-Step "Clearing default post/page content"

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $ids = & docker compose --project-name $script:ComposeProjectName -f (Join-Path $LabPath "docker-compose.yml") --project-directory $LabPath run --rm wpcli post list --post_type=post,page --format=ids 2>&1
  $postListExitCode = $LASTEXITCODE
  $ErrorActionPreference = $previousErrorActionPreference
  if ($postListExitCode -ne 0) {
    throw "wp-cli post list failed"
  }

  $ids = ($ids -join " ").Trim()
  if ([string]::IsNullOrWhiteSpace($ids)) {
    Write-Host "No default post/page content found."
    return
  }

  $idList = $ids -split "\s+" | Where-Object { $_ -match "^\d+$" }
  if (-not $idList -or $idList.Count -eq 0) {
    Write-Host "No numeric post/page IDs found."
    return
  }
  Invoke-WpCli post delete @idList --force
  Write-Host "Deleted post/page IDs: $($idList -join ', ')"
}

Ensure-LabPath
Ensure-LocalEnv
Wait-ForDocker
Resolve-ComposeProjectName

if ($ResetVolumes) {
  Write-Step "Resetting lab volumes"
  Invoke-Compose down -v --remove-orphans
  foreach ($volumeName in @(
    "$($script:ComposeProjectName)_atomic_lab_mysql_data",
    "$($script:ComposeProjectName)_atomic_lab_wordpress_data",
    "atomic-wordpress-lab_atomic_lab_mysql_data",
    "atomic-wordpress-lab_atomic_lab_wordpress_data"
  )) {
    & docker volume rm -f $volumeName *> $null
  }
}

Write-Step "Starting Atomic WordPress lab"
Invoke-Compose up -d --wait mysql wordpress
Wait-ForHttp -Url $SiteUrl

Initialize-WordPress
Clear-DefaultContent

Write-Step "Container status"
Invoke-Compose ps

Write-Step "Lab ready"
Write-Host "WordPress URL: $SiteUrl"
Write-Host "WP Admin URL: $SiteUrl/wp-admin/"
Write-Host "Admin user: $AdminUser"
Write-Host "Admin password: configured locally; value is not printed."
