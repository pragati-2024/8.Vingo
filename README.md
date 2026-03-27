<h1 align="center">🚀 8.Vingo</h1>
<h3 align="center">Food Delivery Web Application</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green"/>
  <img src="https://img.shields.io/badge/Express.js-Framework-black"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-green"/>
  <img src="https://img.shields.io/badge/Status-Active-success"/>
</p>

---

<h2>📌 Overview</h2>

<p>
Vingo is a full-stack food delivery application built with a Node.js backend and React frontend.
It provides secure authentication, efficient shop & item management, smooth order processing, and real-time updates using Socket.io, ensuring a fast, reliable, and user-friendly experience.
</p>

---

<h2>✨ Features</h2>

<ul>
  <li>🔐 User & Admin Authentication (JWT)</li>
  <li>👤 User Profile Management</li>
  <li>🛒 Shop & Item Management</li>
  <li>📦 Order Placement & Tracking</li>
  <li>🚚 Order Processing & Delivery Flow</li>
  <li>🔗 Data Relationships using Mongoose</li>
  <li>⚡ Real-time updates using Socket.io</li>
  <li>📂 MongoDB Database Integration</li>
</ul>

---

<h2>🛠️ Tech Stack</h2>

<table>
  <tr>
    <th>Category</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>React.js (Vite)</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>Node.js, Express.js</td>
  </tr>
  <tr>
    <td>Database</td>
    <td>MongoDB, Mongoose</td>
  </tr>
  <tr>
    <td>Realtime</td>
    <td>Socket.io</td>
  </tr>
  <tr>
    <td>Auth</td>
    <td>JWT</td>
  </tr>
  <tr>
    <td>File Upload</td>
    <td>Multer, Cloudinary</td>
  </tr>
</table>

---

<h2>📁 Project Structure</h2>

<pre>
Vingo
├── 📦 backend
│   ├── ⚙️ config
│   ├── 🎮 controllers
│   ├── 🗂️ models
│   ├── 🛡️ middlewares
│   ├── 🔗 routes
│   ├── ⚡ socket.js
│   ├── 🚀 index.js
│   └── 🔐 .env
│
├── 🎨 frontend
│   ├── 📁 public
│   ├── 📁 src
│   │   ├── 🖼️ assets
│   │   ├── 🧩 components
│   │   ├── 📄 pages
│   │   ├── 🧠 redux
│   │   ├── 🪝 hooks
│   │   ├── 📂 category.js
│   │   ├── 📱 App.jsx
│   │   └── ⚡ main.jsx
│   │
│   ├── 🌐 firebase.js
│   ├── 🎨 index.css
│   ├── 📄 index.html
│   ├── 📦 package.json
│   └── ⚡ vite.config.js
│
└── 📘 README.md
</pre>

---

<h2>⚙️ Installation</h2>

<h4>1️⃣ Clone Repository</h4>

<pre>
git clone https://github.com/your-username/vingo.git
cd vingo
</pre>

<h4>2️⃣ Install Dependencies</h4>

<pre>
cd backend
npm install
</pre>

<h4>3️⃣ Setup Environment Variables</h4>

<p>Create a <b>.env</b> file inside the backend folder and add the following:</p>

<pre>
PORT=5000

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
</pre>

<p><b>⚠️ Note:</b> Never share your .env file publicly.</p>

<h4>4️⃣ Run Project</h4>

<pre>
npm start
</pre>

---

<h2>📡 API Endpoints</h2>

<table>
  <tr>
    <th>Module</th>
    <th>Endpoint</th>
  </tr>
  <tr>
    <td>Auth</td>
    <td>/api/auth</td>
  </tr>
  <tr>
    <td>Users</td>
    <td>/api/users</td>
  </tr>
  <tr>
    <td>Shops</td>
    <td>/api/shops</td>
  </tr>
  <tr>
    <td>Items</td>
    <td>/api/items</td>
  </tr>
  <tr>
    <td>Orders</td>
    <td>/api/orders</td>
  </tr>
</table>

---

<h2>🚀 Future Enhancements</h2>

<ul>
  <li>💳 Payment Integration (Razorpay/Stripe)</li>
  <li>📍 Live Location Tracking</li>
  <li>⭐ Reviews & Ratings</li>
  <li>📱 Mobile Application</li>
</ul>

---

<h2>🤝 Contributors</h2>

<ul>
  <li>👩‍💻 Pragati Bansal</li>
  <li>👩‍💻 Ragini Sahu</li>
  <li>👨‍💻 Prince Pandey</li>
  <li>👨‍💻 Priyanshu Dhakre</li>
  <li>👩‍💻 Parwati Saraswat</li>
</ul>

---

<h2>⭐ Support</h2>

<p>
If you like this project:<br/>
⭐ Star the repo<br/>
🍴 Fork it<br/>
🤝 Contribute
</p>
