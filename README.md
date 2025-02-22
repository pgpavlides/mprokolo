# Broccoli GitHub Creator

## Overview

Broccoli GitHub Creator is a web application that simplifies GitHub repository documentation and exploration. It provides an intuitive interface for browsing, documenting, and managing GitHub repositories.

## Features

- GitHub Authentication
- Repository Browsing
- Repository Structure Visualization
- Markdown Documentation Generation
- Selective File Export
- Matrix-themed UI

## Screenshots

![Home Screen](/docs/screenshots/1_home.png)
![Repositories View](/docs/screenshots/2_repoview.png)
![Single Repository View](/docs/screenshots/3_repo_single.png)
![Export Markdown](/docs/screenshots/4_exportmd.png)
![Export Selected Files](/docs/screenshots/5_export_selected_files.png)

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- GitHub Account

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mprokolo-lib.git
cd mprokolo-lib
```

2. Create a GitHub OAuth App
- Go to GitHub Settings > Developer Settings > OAuth Apps
- Create a new OAuth App with:
  - Homepage URL: `http://localhost:3000`
  - Authorization callback URL: `http://localhost:3000/api/auth/callback`

3. Create a `.env.local` file in the project root
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Install dependencies
```bash
npm install
# or
yarn install
```

5. Run the development server
```bash
npm run dev
# or
yarn dev
```

6. Open `http://localhost:3000` in your browser

## Environment Variables

- `GITHUB_CLIENT_ID`: GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret
- `NEXT_PUBLIC_APP_URL`: Your application's base URL

## Technologies

- Next.js 15
- React
- Tailwind CSS
- GitHub API
- Lucide React Icons

## Security

- Implements secure GitHub OAuth flow
- Uses HTTP-only cookies for token management
- Implements token-based authentication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [Your Email]

Project Link: [https://github.com/yourusername/mprokolo-lib](https://github.com/yourusername/mprokolo-lib)