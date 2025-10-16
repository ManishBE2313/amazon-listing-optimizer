# amazon-listing-optimizer

# 🚀 Amazon Listing Optimizer

An AI-powered web application that fetches real Amazon product listings and generates optimized titles, bullet points, descriptions, and keyword suggestions using **Groq AI (Llama 3.3)**. All optimizations are stored in MySQL with full history tracking.

---

## 🛠️ Tech Stack

### **Backend**
- **Node.js** (v18+)
- **Express.js** - REST API
- **TypeScript** - Type safety
- **MySQL2** - Database driver
- **Puppeteer** - Web scraping
- **Groq SDK** - AI optimization (Llama 3.3-70b)
- **Axios & Cheerio** - HTTP requests & HTML parsing

### **Frontend**
- **React** (v18+)
- **TypeScript**
- **CSS3** - Custom styling
- **Axios** - API calls

### **Database**
- **MySQL** (v8.0+)

### **AI Model**
- **Groq Cloud** - Llama 3.3-70b-versatile

***

## 📦 Project Structure

```
amazon-listing-optimizer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   └── optimizationController.ts
│   │   ├── models/
│   │   │   └── Optimization.ts
│   │   ├── routes/
│   │   │   └── optimizationRoutes.ts
│   │   ├── services/
│   │   │   ├── amazonScraper.ts
│   │   │   └── groqService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── OptimizationForm.tsx
│   │   │   ├── OptimizationResult.tsx
│   │   │   └── OptimizationHistory.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

***

## 🔧 Setup & Installation

### **Prerequisites**
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Git
- Groq API Key ([Get it here](https://console.groq.com/keys))

***

### **1️⃣ Clone Repository**

```bash
git clone [https://github.com/your-username/amazon-listing-optimizer.git](https://github.com/ManishBE2313/amazon-listing-optimizer.git)
cd amazon-listing-optimizer
```

***

### **2️⃣ Backend Setup**

```bash
cd backend
npm install
```

**Create `.env` file:**
```bash
touch .env
```

**Add environment variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=amazon_listing_optimizer
DB_PORT=3306

# Groq AI API Key
GROQ_API_KEY=your_groq_api_key_here

# CORS
FRONTEND_URL=http://localhost:3000
```

**Get Groq API Key:**
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up (free)
3. Create API key
4. Copy and paste in `.env`

***

### **3️⃣ Database Setup**

**Login to MySQL:**
```bash
mysql -u root -p
```

**Create database and table:**
```sql
CREATE DATABASE IF NOT EXISTS amazon_listing_optimizer;

USE amazon_listing_optimizer;

CREATE TABLE IF NOT EXISTS optimizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asin VARCHAR(20) NOT NULL,
  original_title TEXT NOT NULL,
  original_bullets JSON NOT NULL,
  original_description TEXT NOT NULL,
  optimized_title TEXT NOT NULL,
  optimized_bullets JSON NOT NULL,
  optimized_description TEXT NOT NULL,
  suggested_keywords JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asin (asin),
  INDEX idx_created_at (created_at)
);
```

**Exit MySQL:**
```sql
EXIT;
```

***

### **4️⃣ Frontend Setup**

```bash
cd ../frontend
npm install
```

***

### **5️⃣ Start Application**

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
Server running on port 5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

Browser opens automatically at `http://localhost:3000` 🎉

***

## 🧪 End-to-End Testing Guide

### **Test 1: Valid Product Optimization**

1. Open: `http://localhost:3000`
2. Enter ASIN: `B0D14BB5XY` (Philips Air Fryer from Amazon India)
3. Click **"Optimize Product"**
4. Wait 10-15 seconds for:
   - 📦 Fetching from Amazon
   - 🤖 AI optimization

**Expected Result:**
- Original product details (left side)
- Optimized content (right side)
- Keyword suggestions
- Data saved to database

**Backend Console Logs:**
```
📦 Fetching product from Amazon India - ASIN: B0D14BB5XY
🌐 Fetching from Amazon IN: https://www.amazon.in/dp/B0D14BB5XY
⏳ Loading page...
✅ Page loaded: PHILIPS Air Fryer...
✅ Successfully extracted:
   Title: PHILIPS Air Fryer NA120/00...
   Bullets: 5 items
   Description: 201 chars
🤖 Optimizing with Groq AI...
🚀 Sending to Groq AI...
✅ Received response from Groq AI
✅ AI response validated successfully
✅ Optimization saved with ID: 1
```

***

### **Test 2: Different Product**

Try another ASIN: `B0DM2PMQWR` (Acer Monitor)

**Should work the same way!**

***

### **Test 3: View History**

1. Click **"View History"** button
2. See all past optimizations:
   - ASIN
   - Original Title
   - Optimized Title
   - Timestamp
   - View Details

---

### **Test 4: Search History by ASIN**

1. In History view, enter ASIN: `B0D14BB5XY`
2. Click **"Search"**
3. Shows only records for that ASIN

***

## 🗄️ Database Verification

**Open MySQL:**
```bash
mysql -u root -p
USE amazon_listing_optimizer;
```

**Check saved data:**
```sql
-- View all optimizations
SELECT id, asin, LEFT(original_title, 50) AS title, created_at 
FROM optimizations 
ORDER BY created_at DESC;

-- View specific ASIN
SELECT * FROM optimizations 
WHERE asin = 'B0D14BB5XY'\G

-- Count total records
SELECT COUNT(*) AS total FROM optimizations;

-- Group by ASIN
SELECT asin, COUNT(*) AS count 
FROM optimizations 
GROUP BY asin;
```

**Expected:**
- ✅ Records exist
- ✅ JSON fields properly stored
- ✅ Timestamps correct

***

## 🧩 API Endpoints

### **1. Optimize Product**
```bash
POST /api/optimize
Content-Type: application/json

{
  "asin": "B0D14BB5XY"
}
```

### **2. Get All Optimizations**
```bash
GET /api/optimizations
```

### **3. Get by ASIN**
```bash
GET /api/optimizations/:asin
```

### **4. Get by ID**
```bash
GET /api/optimizations/:id
```

### **5. Get History**
```bash
GET /api/optimizations/:asin/history
```

***

## 📝 Test ASINs (Amazon India)

| ASIN | Product | Category |
|------|---------|----------|
| `B0D14BB5XY` | Philips Air Fryer | Kitchen |
| `B0DM2PMQWR` | Acer Monitor | Electronics |
| `B09G9FPHY6` | Samsung Phone | Mobile |
| `B0BSHF7LLL` | Home Product | Home & Kitchen |

***

## ⚠️ Important Notes

### **Amazon Scraping Limitations**
Amazon actively blocks web scraping. This project uses **Puppeteer** with realistic browser headers to fetch product data.

**For production use:**
- Use [Amazon Product Advertising API](https://webservices.amazon.com/paapi5/documentation/) (official, requires approval)
- Use paid services like [RapidAPI Amazon Data](https://rapidapi.com/restyler/api/amazon-data)
- Implement proxy rotation and rate limiting

**For this demo:**
- Works with specific ASINs
- Fetches from Amazon India (`.in` domain)
- May require retries if blocked
- Wait a few minutes between multiple requests

***

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot connect to database` | Check MySQL running: `mysql -u root -p`<br>Verify credentials in `.env` |
| `Port 5000 already in use` | Kill process: `npx kill-port 5000`<br>Or change PORT in `.env` |
| `Groq API error` | Verify API key validity<br>Check quota at [Groq Console](https://console.groq.com) |
| `Amazon scraping fails` | Check internet connection<br>Try different ASIN<br>Wait 2-3 minutes and retry |
| `JSON parse error in history` | Clear database: `TRUNCATE TABLE optimizations;` |
| `CORS error` | Check `FRONTEND_URL` in backend `.env` |
| `Puppeteer installation fails` | Run: `npm install puppeteer --legacy-peer-deps` |

***

## ✅ Final Verification Checklist

### **Backend** ✅
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Amazon scraping works (India region)
- [ ] Groq AI integration working
- [ ] All API endpoints respond
- [ ] Error handling proper
- [ ] Logging clear and useful

### **Frontend** ✅
- [ ] UI loads correctly
- [ ] Form validation works
- [ ] Optimization displays results
- [ ] History view functional
- [ ] Error messages clear
- [ ] Loading states work
- [ ] Responsive design

### **Database** ✅
- [ ] Table created correctly
- [ ] Data saves properly
- [ ] JSON fields parse correctly
- [ ] Timestamps accurate
- [ ] Queries optimized with indexes

### **Integration** ✅
- [ ] Frontend ↔ Backend communication
- [ ] Backend ↔ Database communication
- [ ] Backend ↔ Amazon scraping
- [ ] Backend ↔ Groq AI
- [ ] Full end-to-end flow works

***

## 🎯 Success Criteria

**Your app passes if:**
- ✅ Fetches real Amazon India product data
- ✅ AI optimizes content properly
- ✅ Data saves into MySQL
- ✅ History displays past records
- ✅ Error handling works smoothly
- ✅ UI looks clean and responsive
- ✅ Code is structured and stable

***

## 📸 Screenshots

*(Add your screenshots here)*

1. Home page with optimization form
2. Optimization in progress (loading state)
3. Results showing original vs optimized
4. History view with multiple records
5. Database table with data

***

## 🚀 Deployment (Optional)

### **Backend (Railway/Render)**
1. Push code to GitHub
2. Connect to Railway/Render
3. Add environment variables
4. Deploy

### **Frontend (Vercel/Netlify)**
1. Push to GitHub
2. Connect to Vercel
3. Deploy

### **Database (PlanetScale/Railway)**
1. Create MySQL database
2. Update connection string in `.env`

***

## 📄 License

MIT License - Feel free to use for learning and projects

***

## 👨‍💻 Author

**Your Name**  
GitHub: [@your-username](https://github.com/your-username)  
Email: your.email@example.com

***

## 🙏 Acknowledgments

- **Groq** for fast AI inference
- **Amazon** for product data
- **Puppeteer** for web scraping capabilities

***

**⭐ Made by Manish!**
