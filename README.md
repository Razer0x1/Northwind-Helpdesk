<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100:0f3460&height=200&section=header&text=Northwind%20Helpdesk&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=A%20modern%20support%20ticket%20management%20system&descSize=17&descAlignY=58&descColor=a0c4ff&animation=fadeIn" />

</div>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=4FC3F7&center=true&vCenter=true&width=600&lines=Track+support+tickets+from+open+to+resolved;Assign+%26+manage+agents+in+real-time;REST+API+backend+%2B+React+frontend;Built+with+TypeScript+%26+Node.js" alt="Typing SVG" />

</div>

<br/>

<div align="center">

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![License](https://img.shields.io/badge/License-Unspecified-gray?style=for-the-badge)](#license)

</div>

---

## 📌 Overview

**Northwind Helpdesk** is a full-stack support ticket management application built with **React**, **TypeScript**, and **Node.js**. Designed as a clean, practical demo of a real-world helpdesk workflow — from ticket creation to resolution.

> 💡 Perfect for learning REST API integration, frontend state management, and ticketing system design patterns.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎫 **Ticket Management** | Create, view, update, and close support tickets |
| 👤 **Agent Assignment** | Assign tickets to specific support agents |
| 🔍 **Search & Filter** | Filter tickets by status, priority, or agent |
| 🔗 **REST API Backend** | Clean API endpoints with a decoupled React frontend |
| 📱 **Responsive UI** | Works across desktop and mobile |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, JavaScript |
| **Backend** | Node.js, REST API |
| **Runtime** | Node.js 16+ |
| **Build Tool** | npm / Vite |

</div>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js 16+** installed. Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:

```bash
nvm install 16
nvm use 16
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Razer0x1/Northwind-Helpdesk.git

# 2. Navigate into the project
cd Northwind-Helpdesk

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open your browser at `http://localhost:3000` (or the port shown in your terminal).

### Production Build

```bash
# Build for production
npm run build

# Start the production server
npm start
```

---

## 📁 Project Structure

```
Northwind-Helpdesk/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── api/              # REST API client / services
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔗 API Overview

The backend exposes a REST API for ticket operations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets` | Get all tickets |
| `POST` | `/api/tickets` | Create a new ticket |
| `GET` | `/api/tickets/:id` | Get a ticket by ID |
| `PUT` | `/api/tickets/:id` | Update a ticket |
| `DELETE` | `/api/tickets/:id` | Delete a ticket |
| `GET` | `/api/agents` | Get all agents |
| `PUT` | `/api/tickets/:id/assign` | Assign ticket to agent |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork this repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please open an **issue first** to discuss major changes before submitting a PR.

---

## 📄 License

This repository currently has **no license specified**.  
If you plan to use or distribute this project, consider adding a `LICENSE` file.  
→ [Choose a license](https://choosealicense.com)

---

## 👨‍💻 Author

<div align="center">

**Bhargav Haldipur** · [Razer0x1](https://github.com/Razer0x1)

[![GitHub](https://img.shields.io/badge/GitHub-Razer0x1-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Razer0x1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-bhargav--haldipur-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/bhargav-haldipur)
[![Gmail](https://img.shields.io/badge/Gmail-bhargav.haldipur2004-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:bhargav.haldipur2004@gmail.com)

</div>

---

<div align="center">

⭐ **If this project helped you, give it a star!** ⭐

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,50:16213e,100:1a1a2e&height=120&section=footer" />

</div>
