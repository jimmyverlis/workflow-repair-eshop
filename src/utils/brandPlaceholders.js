const FALLBACK_PRIMARY = '#3b82f6';

function normalizeHexColor(color, fallback = FALLBACK_PRIMARY) {
  if (typeof color !== 'string') return fallback;

  const value = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  return fallback;
}

function shiftHexColor(hex, amount) {
  const value = normalizeHexColor(hex).slice(1);
  const channels = [0, 2, 4].map(index => {
    const channel = Number.parseInt(value.slice(index, index + 2), 16);
    return Math.max(0, Math.min(255, channel + amount));
  });

  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function storeInitials(storeName = '') {
  const parts = String(storeName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'ES';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function createStoreLogoPlaceholder(storeName, primaryColor = FALLBACK_PRIMARY) {
  const base = normalizeHexColor(primaryColor);
  const accent = shiftHexColor(base, -28);
  const initials = escapeXml(storeInitials(storeName));
  const safeName = escapeXml(storeName || 'E-Shop');

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120" fill="none">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="320" y2="120" gradientUnits="userSpaceOnUse">
          <stop stop-color="${base}" />
          <stop offset="1" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="320" height="120" rx="28" fill="url(#logo-gradient)" />
      <rect x="18" y="18" width="84" height="84" rx="24" fill="rgba(255,255,255,0.18)" />
      <text x="60" y="71" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${initials}</text>
      <text x="122" y="52" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">${safeName}</text>
      <text x="122" y="77" font-family="Arial, sans-serif" font-size="12" letter-spacing="2" fill="rgba(255,255,255,0.78)">ONLINE STORE</text>
    </svg>
  `);
}

export function createPromoBannerPlaceholder({
  storeName,
  title,
  subtitle,
  primaryColor = FALLBACK_PRIMARY,
  textColor = '#ffffff',
}) {
  const base = normalizeHexColor(primaryColor);
  const accent = shiftHexColor(base, -36);
  const highlight = shiftHexColor(base, 28);
  const safeTitle = escapeXml(title || 'Featured collection');
  const safeSubtitle = escapeXml(subtitle || `Fresh picks from ${storeName || 'the store'}`);
  const safeStore = escapeXml(storeName || 'E-Shop');
  const safeText = escapeXml(normalizeHexColor(textColor, '#ffffff'));

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="640" viewBox="0 0 1600 640" fill="none">
      <defs>
        <linearGradient id="banner-gradient" x1="0" y1="0" x2="1600" y2="640" gradientUnits="userSpaceOnUse">
          <stop stop-color="${base}" />
          <stop offset="1" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1600" height="640" rx="42" fill="url(#banner-gradient)" />
      <circle cx="1290" cy="170" r="180" fill="${highlight}" fill-opacity="0.18" />
      <circle cx="1450" cy="480" r="130" fill="#ffffff" fill-opacity="0.08" />
      <rect x="920" y="90" width="520" height="460" rx="36" fill="#ffffff" fill-opacity="0.08" />
      <text x="110" y="160" font-family="Arial, sans-serif" font-size="28" letter-spacing="4" fill="${safeText}" fill-opacity="0.72">${safeStore}</text>
      <text x="110" y="270" font-family="Arial, sans-serif" font-size="84" font-weight="700" fill="${safeText}">${safeTitle}</text>
      <text x="110" y="350" font-family="Arial, sans-serif" font-size="34" fill="${safeText}" fill-opacity="0.86">${safeSubtitle}</text>
      <text x="1080" y="320" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${safeText}" fill-opacity="0.82">Upload banner image</text>
      <text x="1080" y="372" font-family="Arial, sans-serif" font-size="24" fill="${safeText}" fill-opacity="0.68">1600 x 640 recommended</text>
    </svg>
  `);
}

export function createDefaultPromoBanners({ storeName, primaryColor = FALLBACK_PRIMARY }) {
  return [
    {
      title: 'Featured products',
      subtitle: 'Browse devices, parts and accessories ready for pickup or delivery.',
      buttonLabel: 'Shop products',
      buttonUrl: '/products',
      badge: 'Storefront',
      backgroundColor: primaryColor,
      textColor: '#ffffff',
      imageUrl: createPromoBannerPlaceholder({
        storeName,
        title: 'Featured products',
        subtitle: 'Browse devices, parts and accessories ready for pickup or delivery.',
        primaryColor,
      }),
    },
    {
      title: 'Book repairs online',
      subtitle: 'Let customers request service online even before custom campaign artwork is ready.',
      buttonLabel: 'Book repair',
      buttonUrl: '/repair-booking',
      badge: 'Service',
      backgroundColor: shiftHexColor(primaryColor, -26),
      textColor: '#ffffff',
      imageUrl: createPromoBannerPlaceholder({
        storeName,
        title: 'Book repairs online',
        subtitle: 'Let customers request service online even before custom campaign artwork is ready.',
        primaryColor: shiftHexColor(primaryColor, -26),
      }),
    },
  ];
}
