$css = Get-Content -Raw "frontend/src/app/globals.css"

$new_css = @'
:root {
  --background: #020617;
  --foreground: #F8FAFC;
  --surface: rgba(15, 23, 42, 0.7);
  --surface-hover: rgba(15, 23, 42, 0.9);
  --border: rgba(30, 41, 59, 1);
  --border-hover: rgba(51, 65, 85, 1);
  --accent-gold: #22C55E;
  --accent-gold-light: #4ADE80;
  --accent-warm: #14B8A6;
  --accent-teal: #0EA5E9;
  --accent-purple: #8B5CF6;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #475569;
  --gradient-heritage: linear-gradient(135deg, #22C55E 0%, #14B8A6 50%, #0EA5E9 100%);
  --gradient-glass: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.8) 100%);
  --shadow-glow: 0 0 15px rgba(34, 197, 94, 0.5);
  --font-sans: 'Fira Sans', sans-serif;
  --font-serif: 'Fira Code', monospace;
}
'@

$css = $css -replace ':root\s*\{[^}]+\}', $new_css

$css = $css -replace 'rgba\(15, 23, 42, 0.15\)', 'rgba(255, 255, 255, 0.15)'
$css = $css -replace 'rgba\(15, 23, 42, 0.25\)', 'rgba(255, 255, 255, 0.25)'
$css = $css -replace 'color: #FFFFFF;', 'color: #020617;'

Set-Content "frontend/src/app/globals.css" $css

$page = Get-Content -Raw "frontend/src/app/page.tsx"
$page = $page -replace 'rgba\(225, 29, 72,', 'rgba(34, 197, 94,'
$page = $page -replace 'rgba\(139, 92, 246,', 'rgba(14, 165, 233,'
$page = $page -replace 'rgba\(37, 99, 235,', 'rgba(20, 184, 166,'
$page = $page -replace 'rgba\(244, 63, 94,', 'rgba(34, 197, 94,'
$page = $page -replace 'linear-gradient\(135deg, #f1f5f9 0%, #e2e8f0 100%\)', 'linear-gradient(135deg, #0f172a 0%, #020617 100%)'
Set-Content "frontend/src/app/page.tsx" $page

