# Cursor Migration Guide - ReturnGuard Application

## Project Overview

**ReturnGuard** is an AI-powered smart returns inspection system built with modern web technologies. The application provides automated robotic inspection capabilities to detect fraud, verify authenticity, and process returns within 72 hours.

### Technology Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React Context API + TanStack Query 5.83.0
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76
- **Icons**: Lucide React 0.462.0
- **Charts**: Recharts 2.15.4

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui component library
│   ├── AppSidebar.tsx  # Main navigation sidebar
│   ├── CountdownTimer.tsx
│   ├── FraudScoreMeter.tsx
│   ├── InspectionProgress.tsx
│   └── ...
├── pages/              # Route pages
│   ├── Landing.tsx     # Homepage
│   ├── CustomerPortal.tsx
│   ├── SellerPortal.tsx
│   ├── AdminDashboard.tsx
│   ├── InspectionSimulation.tsx
│   └── NotFound.tsx
├── context/            # React Context providers
│   └── DemoContext.tsx # Demo state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   └── fraudLogic.ts  # Fraud detection logic
├── lib/                # Library utilities
│   └── utils.ts        # General utilities (cn helper, etc.)
└── assets/             # Static assets
    └── hero-robot.jpg
```

### Application Features

1. **Landing Page** (`/`) - Marketing homepage with hero section
2. **Customer Portal** (`/customer`) - Customer-facing return submission interface
3. **Seller Portal** (`/seller`) - Seller dashboard for managing returns
4. **Admin Dashboard** (`/admin`) - Administrative interface
5. **Inspection Simulation** (`/inspection`) - Real-time inspection process visualization

### Key Components

- **DemoContext**: Manages demo state, return items, and inspection progress
- **Fraud Detection**: AI-powered fraud scoring system (simulated)
- **Robotic Arm Animation**: Visual representation of inspection process
- **Countdown Timer**: 72-hour processing deadline tracking

---

## Migration Steps: Removing Lovable Dependencies

This project was originally created in Lovable.dev. Follow these steps to disconnect from Lovable and run the application in your local development environment.

### Step 1: Remove Lovable Tagger Dependency

The `lovable-tagger` package is used for development-time component tagging in Lovable's IDE. It's not needed for local development.

**Action**: Remove from `package.json` devDependencies and update `vite.config.ts`

### Step 2: Update Vite Configuration

Remove the `componentTagger` import and usage from `vite.config.ts`.

**File**: `vite.config.ts`
- Remove: `import { componentTagger } from "lovable-tagger";`
- Remove: `componentTagger()` from plugins array

### Step 3: Update Meta Tags

Remove Lovable.dev references from `index.html` meta tags.

**File**: `index.html`
- Update `og:image` and `twitter:image` meta tags to use your own image URLs or remove them

### Step 4: Update README.md (Optional)

Replace Lovable-specific instructions with your own project documentation.

---

## Local Development Setup

### Prerequisites

- **Node.js**: Version 18.x or higher (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun**: Package manager (project includes both `package-lock.json` and `bun.lockb`)

### Installation Steps

1. **Install Dependencies**

   ```bash
   npm install
   # OR
   bun install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   # OR
   bun run dev
   ```

   The application will be available at `http://localhost:8080` (configured in `vite.config.ts`)

3. **Build for Production**

   ```bash
   npm run build
   # OR
   bun run build
   ```

   Output will be in the `dist/` directory.

4. **Preview Production Build**

   ```bash
   npm run preview
   # OR
   bun run preview
   ```

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

---

## Configuration Details

### Vite Configuration

- **Port**: 8080 (configurable in `vite.config.ts`)
- **Host**: `::` (all interfaces)
- **Path Alias**: `@/` maps to `./src/`
- **Plugin**: React SWC for fast refresh

### TypeScript Configuration

- **Base URL**: `.` (project root)
- **Path Mapping**: `@/*` → `./src/*`
- **Strict Mode**: Disabled (for flexibility)
- **Allow JS**: Enabled

### Tailwind Configuration

- **Dark Mode**: Class-based (`dark:` prefix)
- **Content Paths**: All TypeScript/TSX files in `src/`, `pages/`, `components/`, `app/`
- **Theme**: Custom color system with CSS variables
- **Plugins**: `tailwindcss-animate` for animations

---

## Environment Variables

Currently, no environment variables are required. If you need to add API endpoints or configuration:

1. Create a `.env` file in the project root
2. Add variables with `VITE_` prefix (required for Vite)
3. Access in code via `import.meta.env.VITE_YOUR_VAR`

Example:
```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=ReturnGuard
```

---

## Deployment Options

After removing Lovable dependencies, you can deploy to:

- **Vercel**: Connect your Git repository, Vite is auto-detected
- **Netlify**: Use build command `npm run build`, publish directory `dist`
- **Cloudflare Pages**: Similar to Netlify
- **AWS S3 + CloudFront**: Upload `dist/` folder
- **Docker**: Create a Dockerfile using Node.js and serve the built files

### Example Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, update `vite.config.ts`:
```typescript
server: {
  port: 3000, // or any available port
}
```

### Module Resolution Issues

If you see `@/` import errors:
1. Verify `tsconfig.json` has correct path mapping
2. Check `vite.config.ts` has the alias configured
3. Restart your IDE/editor

### Build Errors

1. Clear `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

---

## Next Steps

1. ✅ Remove Lovable dependencies (follow steps above)
2. ✅ Set up local development environment
3. 🔄 Configure environment variables if needed
4. 🔄 Set up CI/CD pipeline
5. 🔄 Configure custom domain (if deploying)
6. 🔄 Add analytics/monitoring (optional)
7. 🔄 Set up error tracking (e.g., Sentry)

---

## Additional Notes

- The application uses **client-side routing** (React Router), so ensure your hosting provider supports SPA routing (redirect all routes to `index.html`)
- All state is currently managed client-side (no backend API)
- Fraud detection logic is simulated in `src/utils/fraudLogic.ts`
- The demo context provides mock data for demonstration purposes

---

## Support & Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
