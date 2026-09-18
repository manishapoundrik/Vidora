# Vidora Creative — Phase 2

Full-stack foundation for the video editing agency.

## Architecture
- React + Vite frontend
- Node.js + Express API
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Role-based access: editor / client / admin
- Multer uploads with 250 MB limit and MP4/MOV/JPG/PNG validation
- Admin moderation and feature controls
- Public anonymous showcase
- Shareable editor portfolio routes: `/editor/:slug`
- Client inquiry workflow

## Setup
1. Install Node.js 18+.
2. Install MongoDB locally, or create a MongoDB Atlas database.
3. Copy `.env.example` to `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Frontend: http://localhost:5173
7. API: http://localhost:5000/api/health

Default development admin comes from `.env`: `admin@vidora.local` / `Admin@12345` unless changed.

## Uploads
Phase 2 stores files in `/uploads` so the system works locally. For production, replace the Multer disk storage adapter with AWS S3, Cloudflare R2, Mux or Cloudflare Stream and store only the resulting URL/key in MongoDB.

## Production checklist
- Use HTTPS and a strong random JWT secret.
- Move uploads to object storage/CDN.
- Add rate limiting and request validation.
- Add email verification/password reset.
- Add virus/malware scanning for uploads.
- Use signed/private video URLs where client assets require confidentiality.
- Configure MongoDB backups and least-privilege credentials.
- Deploy frontend and API separately or behind one reverse proxy.
