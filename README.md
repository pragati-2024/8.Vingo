
## Vingo

### Backend

- `cd backend`
- Create `backend/.env` (start from `backend/.env.example`)
- `npm install`
- `npm run dev`

**Auto image by name (Pexels)**

- Set `PEXELS_API_KEY` in `backend/.env`
- Create a new Shop/Item **without uploading an image**
- Backend will fetch an image URL using the shop/item name and store it in MongoDB

**Fix wrong auto-images (one-time)**

- If existing items (e.g. "Burger") got a wrong image earlier, run:
- `cd backend`
- `npm run fix:auto-images`

### Frontend

- `cd frontend`
- `npm install`
- `npm run dev`

Frontend talks to backend at `http://localhost:8001` (see `frontend/src/config.js`).
