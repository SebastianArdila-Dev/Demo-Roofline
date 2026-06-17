# Sistema de Diseño — Roofline Demo

Inspirado en el lenguaje visual de Apple: minimalismo, tipografía grande, animaciones suaves y espaciado generoso.

---

## Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `--black` | `#000000` | Fondo base |
| `--bg` | `#050505` | Fondo principal |
| `--bg-2` | `#0F0F0F` | Fondo alternativo |
| `--surface` | `#1C1C1E` | Tarjetas / superficies |
| `--surface-2` | `#2C2C2E` | Elementos secundarios |
| `--border` | `rgba(255,255,255,0.07)` | Bordes sutiles |
| `--text-1` | `#F5F5F7` | Texto principal |
| `--text-2` | `#A1A1A6` | Texto secundario |
| `--text-3` | `#6E6E73` | Texto terciario |
| `--accent` | `#0071E3` | Azul Apple — CTAs |
| `--accent-2` | `#409CFF` | Azul claro |
| `--purple` | `#BF5AF2` | Púrpura — detalles |
| `--green-wa` | `#25D366` | WhatsApp verde |

## Tipografía

- **Display**: `-apple-system, BlinkMacSystemFont, "SF Pro Display"` → en macOS renderiza SF Pro
- **Fallback**: `"Inter", "Helvetica Neue", Arial, sans-serif`
- **Mono**: `"SF Mono", Menlo, Monaco, monospace`

### Escala tipográfica (clamp responsive)

| Nombre | Tamaño |
|---|---|
| Display XL | `clamp(56px, 9vw, 120px)` |
| Display | `clamp(40px, 7vw, 88px)` |
| H2 | `clamp(28px, 4.5vw, 56px)` |
| H3 | `clamp(20px, 2.5vw, 28px)` |
| Body | `clamp(16px, 1.3vw, 19px)` |
| Small | `14px` |

## Animaciones

| Nombre | Duración | Easing |
|---|---|---|
| Standard | `0.6s` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Entrada | `0.8s` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Spring | `0.7s` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Shimmer hover | `0.6s` | `ease` |

## Spacing

- Section padding: `clamp(80px, 12vw, 160px)`
- Container max-width: `1200px`
- Container padding: `min(5vw, 60px)`
- Card padding: `clamp(24px, 3vw, 40px)`
- Border radius (card): `20px`
- Border radius (button): `980px` (pill)

## Efectos especiales

- **Frosted nav**: `backdrop-filter: blur(20px) saturate(180%)`
- **Orbes hero**: radial-gradient + blur(80px) + float animation
- **3D tilt cards**: perspective(1000px) + rotateX/Y en hover
- **Shimmer buttons**: pseudo-element translateX sweep
- **WhatsApp pulse**: scale + opacity ring animation
- **Marquee**: CSS animation translate infinito
- **Counters**: requestAnimationFrame count-up
