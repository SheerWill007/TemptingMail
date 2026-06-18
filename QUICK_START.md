# Quick Start Guide

## Installation Steps

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install gsap lenis
# or
pnpm add gsap lenis
```

### 2. Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tempmail
SMTP_DOMAIN=temp.willx.tech
MAIL_DOMAIN=temp.willx.tech
API_PORT=3001
CLEANUP_ENABLED=true
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SITE_URL=https://temp.willx.tech
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## What's New

### ✨ Features Added

1. **GSAP Floating Card Animation**
   - Smooth entrance animation
   - Continuous floating motion
   - Mouse parallax effect with 3D rotation

2. **Lenis Smooth Scrolling**
   - Buttery smooth page scrolling
   - Configurable smoothness (lerp: 0.08)

3. **Borderless Design**
   - Clean, modern cards with shadows
   - No dashed borders anywhere
   - Elevated design language

4. **Updated Attribution**
   - Made by WilliamBenLaw
   - Links to: https://github.com/SheerWill007
   - Positioned in bottom left

5. **Removed GitHub Stars Button**
   - Cleaner header design
   - Focus on core functionality

### 🎨 Design System

**Colors (from your palette):**
- Background: `#DBDBDB` (Light) / `#0A0A0A` (Dark)
- Primary: `#373839` (Dark Summoning)
- Secondary: `#999999` (Million Grey)
- Muted: `#5F6062` (Kettleman)
- Card: `#FFFFFF` (Light) / `#1F1F20` (Dark - Inkwell Inception)

**Shadows:**
- Cards: `shadow-xl`
- Hover states: `shadow-lg`
- Email items: `shadow-md`

**Border Radius:**
- Large cards: `rounded-2xl`
- Small elements: `rounded-xl`
- Buttons: `rounded-full`

### 🚀 Performance

- Hardware-accelerated GSAP animations
- Lenis smooth scrolling (60fps)
- Optimized React re-renders
- CSS-based transitions

### 📱 Responsive Design

- Mobile-first approach
- Separate mobile and desktop views
- Touch-friendly interactions
- Adaptive layouts

## Testing

1. **Homepage:**
   - Check floating card animation
   - Test smooth scrolling
   - Verify email creation

2. **Mailbox:**
   - Check email list display
   - Test refresh functionality
   - Verify card shadows

3. **Message View:**
   - Check email content rendering
   - Verify back navigation
   - Test responsiveness

4. **Footer:**
   - Verify "Made by WilliamBenLaw" appears
   - Test GitHub link: https://github.com/SheerWill007
   - Check bottom-left positioning

## Troubleshooting

**GSAP not working:**
```bash
npm install gsap@latest
```

**Lenis not working:**
```bash
npm install lenis@latest
```

**Styles not applying:**
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run dev`

**Database errors:**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Production Deployment

1. **DNS Configuration:**
   - A record: `temp.willx.tech` → Your server IP
   - MX record: `temp.willx.tech` → Mail server

2. **SSL Certificate:**
   ```bash
   certbot --nginx -d temp.willx.tech
   ```

3. **Build:**
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

4. **SMTP Server:**
   - Configure port 25 for email receiving
   - Update firewall rules
   - Test with test emails

## Support

For issues or questions:
- GitHub: https://github.com/SheerWill007
- Create an issue in your repository

## License

Update the LICENSE file with your information if needed.