This is a [Next.js](https://nextjs.org) project bootstrapped with TypeScript and Tailwind CSS, configured for Vercel deployment.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router directory
- `app/layout.tsx` - Root layout component
- `app/page.tsx` - Home page
- `app/globals.css` - Global styles with Tailwind CSS
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration
- `vercel.json` - Vercel deployment configuration

## Deployment on Vercel

The project is already configured for Vercel deployment. To deploy:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and use the settings from `vercel.json`

Alternatively, use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

