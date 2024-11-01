# Google Drive Image Feed

This Vue.js application allows users to browse and view images from a specific Google Drive folder. It uses the Google Drive API to fetch subfolders and images, and displays them in a user-friendly interface.

## Features

- Google account authentication
- Display subfolders of a specific Google Drive folder
- View images within selected subfolders
- Responsive design using DaisyUI and Tailwind CSS

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- A Google Cloud Platform project with the Google Drive API enabled
- Google API credentials (API Key and OAuth 2.0 Client ID)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/google-drive-image-feed.git
   cd google-drive-image-feed
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google API credentials and root folder ID:
   ```
   VITE_GOOGLE_API_KEY=your_api_key_here
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   VITE_ROOT_FOLDER_ID=your_root_folder_id_here
   ```

   Replace `your_api_key_here`, `your_client_id_here`, and `your_root_folder_id_here` with your actual Google API key, client ID, and the ID of the Google Drive folder you want to use as the root.

## Usage

To run the application in development mode:

```
npm run dev
```

This will start the development server, typically at `http://localhost:5173`.

To build the application for production:

```
npm run build
```

This will generate a `dist` folder with the built application.

To serve the `dist` directory using `http-server`:

```
npm run serve
```

This will start an HTTP server and serve the `dist` directory on port 8080.

## Google API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google Drive API for your project.
4. Create credentials (API key and OAuth 2.0 Client ID) for a Web application.
5. Add `http://localhost:5173` to the authorized JavaScript origins for development.
6. Add your production URL to the authorized JavaScript origins for production use.

## Deploying to GitHub Pages using GitHub Actions

To deploy this application to GitHub Pages using GitHub Actions, follow these steps:

1. Ensure that the `base` property in the `vite.config.js` file is set to `'/google-drive-image-feed/'`.

2. Create a new GitHub Actions workflow file `deploy.yml` in the `.github/workflows` directory with the following content:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout repository
           uses: actions/checkout@v2

         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '20'

         - name: Install dependencies
           run: npm install

         - name: Build project
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. Commit and push your changes to the `main` branch. The GitHub Actions workflow will automatically build and deploy your application to GitHub Pages.

## Contributing

Contributions to the Google Drive Image Feed project are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project uses the following license: [MIT License](LICENSE).

## Acknowledgements

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Google Drive API](https://developers.google.com/drive)
- [DaisyUI](https://daisyui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
