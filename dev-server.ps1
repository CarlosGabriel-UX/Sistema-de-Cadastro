param(
    [int]$Port = 5500,
    [string]$Root = ".",
    [string]$Address = "127.0.0.1"
)

# Rely on built-in .NET types loaded by PowerShell; no explicit Add-Type required.

function Get-ContentType {
    param([string]$Path)
    switch -Regex ($Path.ToLower()) {
        ".*\.html$" { return "text/html" }
        ".*\.htm$" { return "text/html" }
        ".*\.css$" { return "text/css" }
        ".*\.js$" { return "application/javascript" }
        ".*\.json$" { return "application/json" }
        ".*\.svg$" { return "image/svg+xml" }
        ".*\.png$" { return "image/png" }
        ".*\.jpg$" { return "image/jpeg" }
        ".*\.jpeg$" { return "image/jpeg" }
        ".*\.gif$" { return "image/gif" }
        default { return "application/octet-stream" }
    }
}

$prefix = "http://$($Address):$($Port)/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Clear()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "[dev-server] Servindo '$Root' em $prefix" -ForegroundColor Green

try {
    while ($true) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($path)) { $path = "index.html" }
        $fsPath = Join-Path $Root $path

        if (Test-Path $fsPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($fsPath)
            $response.ContentType = Get-ContentType -Path $fsPath
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = "Not Found: $path"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}