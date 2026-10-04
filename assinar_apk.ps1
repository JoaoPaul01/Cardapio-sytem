param (
    [string]$ApkIn = "Cardápio-unsigned.apk",
    [string]$ApkOut = "cardapio-assinado.apk"
)

$Zipalign = "C:\Android\build-tools\android-14\zipalign.exe"
$Apksigner = "C:\Android\build-tools\android-14\apksigner.bat"
$Java = "C:\Android\jdk\jdk-21.0.4+7\bin\java.exe"

# O apksigner em .bat as vezes usa o comando 'java' global. Vamos garantir que usa o nosso portátil
$env:JAVA_HOME = "C:\Android\jdk\jdk-21.0.4+7"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

if (-Not (Test-Path $ApkIn)) {
    Write-Host "ERRO: Arquivo $ApkIn não encontrado na pasta!" -ForegroundColor Red
    exit 1
}

Write-Host "1. Alinhando o APK com zipalign..." -ForegroundColor Cyan
if (Test-Path "temp-aligned.apk") { Remove-Item "temp-aligned.apk" }
& $Zipalign -v -p 4 $ApkIn "temp-aligned.apk" | Out-Null

Write-Host "2. Assinando o APK com apksigner..." -ForegroundColor Cyan
& $Apksigner sign --ks release.keystore --ks-key-alias cardapio --ks-pass pass:cardapio123 --key-pass pass:cardapio123 --out $ApkOut "temp-aligned.apk" | Out-Null

Write-Host "3. Verificando a assinatura..." -ForegroundColor Cyan
& $Apksigner verify --verbose $ApkOut

Remove-Item "temp-aligned.apk"

Write-Host "✅ PRONTO! APK assinado salvo como: $ApkOut" -ForegroundColor Green
