# 🌿 JanSeva — Smart Resource Allocation for Social Impact

JanSeva is a civic-tech platform designed to bridge the gap between NGOs, volunteers, and citizens. It enables smart resource allocation, transparent service tracking, and efficient volunteer coordination for maximum social impact.

---

## 📁 Project Structure

```
JanSeva/
├── Frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components (Home, About, Services, etc.)
│   │   └── ...
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── Backend/           # Node.js backend (coming soon)
│   └── server.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ — [Download](https://nodejs.org/)
- **npm** v9+

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp Frontend/.env.example Frontend/.env
```

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| UI        | React 18, React Router v7               |
| Styling   | Tailwind CSS v4                         |
| Charts    | Recharts                                |
| Icons     | Lucide React                            |
| Build     | Vite 6                                  |
| Backend   | Node.js (planned)                       |

---

## 📄 Pages

- **Home** — Hero, mission highlights, impact stats
- **About** — Team, story, and values
- **Statistics** — Data visualizations (Recharts)
- **Services** — NGO services catalog
- **Contact** — Reach out form

---

## 🤝 Contributing

1. Fork this repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📃 License

This project is open source and available under the [MIT License](LICENSE).
