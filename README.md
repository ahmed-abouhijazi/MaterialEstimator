# BuildCalc Pro - Construction Material Estimator

AI-powered construction material estimator with accurate cost calculations, location-based pricing, and real-time market insights.

## 🚀 Features

- **Accurate Material Calculations**: Industry-standard formulas for precise material quantities
- **AI-Powered Pricing**: Dynamic cost adjustments based on location and market conditions
- **Multiple Project Types**: Support for houses, rooms, walls, roofs, extensions, foundations, and renovations
- **Quality Levels**: Choose from basic, standard, or premium materials
- **Location-Based Pricing**: Regional price adjustments for accurate estimates
- **PDF Export**: Professional reports for contractors and suppliers
- **Real-Time Insights**: AI-generated recommendations and market trends
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: OpenAI GPT-3.5/4
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## 📋 Prerequisites

- Node.js 18+ or compatible runtime
- pnpm (recommended) or npm
- OpenAI API key (for AI features)

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd material-estimator-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Add your environment variables to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Add environment variables in Vercel project settings:
   - `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET` (if using auth)
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

Or use Vercel CLI:
```bash
pnpm vercel
```

### Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered features
- `NEXT_PUBLIC_APP_URL`: Public URL of your application

Optional:
- `DATABASE_URL`: Database connection string (for saving estimates)
- `NEXTAUTH_SECRET`: Secret for NextAuth.js authentication
- `NEXTAUTH_URL`: NextAuth.js callback URL
- `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID

## 📖 Usage

### Basic Workflow

1. **Choose Project Type**: Select from house, room, wall, roof, extension, foundation, or renovation
2. **Enter Dimensions**: Input length, width, and height in meters
3. **Select Location**: Choose your region for accurate pricing
4. **Choose Quality**: Select basic, standard, or premium materials
5. **Calculate**: Get instant material list and cost estimate
6. **Export**: Print or share your estimate

### API Endpoints

- `POST /api/estimate`: Calculate materials with AI-powered pricing
- `POST /api/ai-insights`: Get market insights and recommendations
- `POST /api/export-pdf`: Generate PDF estimate report

## 🧪 Testing

Run type checking:
```bash
pnpm type-check
```

Run linting:
```bash
pnpm lint
```

## 📊 Project Structure

```
material-estimator-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard page
│   ├── estimator/            # Estimator pages
│   ├── how-it-works/         # Information page
│   ├── pricing/              # Pricing page
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # UI components
│   ├── estimator/            # Estimator components
│   ├── landing/              # Landing page sections
│   └── ...
├── lib/                      # Utility functions
│   ├── calculations.ts       # Material calculation engine
│   ├── ai-pricing.ts         # AI pricing adjustments
│   ├── ai-insights.ts        # AI market insights
│   └── utils.ts              # Helpers
└── public/                   # Static assets
```

## 🎯 Key Features Explained

### Material Calculation Engine

The app uses industry-standard formulas for material calculations:
- Concrete volume calculations for foundations and slabs
- Block/brick quantities based on wall area
- Roofing materials with pitch and overhang adjustments
- Electrical wiring and plumbing based on floor area
- Waste buffer percentages per project type

### AI-Powered Pricing

When OpenAI API key is configured, the app:
- Analyzes regional market conditions
- Adjusts prices based on current trends
- Provides seasonal buying recommendations
- Suggests material alternatives for budget optimization

### Location-Based Adjustments

Regional price multipliers account for:
- Local labor costs
- Material availability
- Transportation costs
- Market demand

## 🔐 Security

- API routes protected with validation
- Environment variables for sensitive data
- Client-side calculations as fallback
- Rate limiting on API endpoints (recommended in production)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🐛 Known Issues

- PDF export requires print-to-PDF functionality
- AI features require OpenAI API key
- Calculations are estimates; consult professionals for final quotes

## 📞 Support

For issues or questions, please contact support or open an issue in the repository.

## 🚀 Roadmap

- [ ] User authentication and saved estimates
- [ ] Database integration for estimate history
- [ ] Advanced PDF generation with custom branding
- [ ] Material supplier API integration
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Contractor collaboration features

---

Built with ❤️ using Next.js and AI
