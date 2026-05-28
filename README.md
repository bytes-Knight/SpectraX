# SpectraX

SpectraX is a high-performance XSS (Cross-Site Scripting) reconnaissance tool built with [Wails](https://wails.io/) (Go + React). It's designed for security researchers and bug hunters to efficiently identify potential XSS vulnerabilities by analyzing how inputs are reflected in both HTML and the DOM.

## 🚀 Features

-   **Intelligent URL Deduplication:** Uses a structural fingerprinting algorithm (inspired by Uro) to filter out redundant URLs, saving time during scans.
-   **Dual Reflection Detection:** Checks for reflections in both static HTML responses and dynamic DOM environments (using Headless Chrome).
-   **Character Analysis:** Automatically tests common XSS characters (`"`, `'`, `<`, `>`, `$`, `|`, `(`, `)`, ` `, `:`, `;`, `{`, `}`) to determine if they are **Allowed**, **Blocked**, or **Converted**.
-   **Native File Integration:** Easily load large lists of URLs via a native file selection dialog.
-   **Real-time Results:** View scan progress and identified vulnerabilities instantly through a sleek, reactive UI.
-   **Cross-Platform:** Leverages Wails to provide a native desktop experience on Windows, macOS, and Linux.

## 🛠️ Built With

-   **Backend:** [Go](https://golang.org/)
-   **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **Desktop Framework:** [Wails v2](https://wails.io/)
-   **Headless Browser:** [chromedp](https://github.com/chromedp/chromedp)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

-   [Go](https://go.dev/dl/) (Latest version)
-   [Node.js](https://nodejs.org/) & [NPM](https://www.npmjs.com/)
-   [Wails CLI](https://wails.io/docs/gettingstarted/installation)

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bytes-Knight/SpectraX.git
    cd SpectraX
    ```

2.  **Install dependencies:**
    ```bash
    # For the Go backend
    go mod tidy

    # For the frontend
    cd frontend
    npm install
    cd ..
    ```

3.  **Run in development mode:**
    ```bash
    wails dev
    ```

4.  **Build for production:**
    ```bash
    wails build
    ```

## 📸 Usage

1.  Launch **SpectraX**.
2.  Click "Select URL List" to upload your target URLs.
3.  (Optional) Enable "Deduplication" to filter redundant paths.
4.  Click "Start Scan" and watch for reflected parameters and character analysis results.

## ⚠️ Disclaimer

This tool is for educational and authorized security testing purposes only. The author is not responsible for any misuse or damage caused by this tool. Always obtain permission before testing any target.

## 👤 Author

-   **Bytes_Knight** - [mdlimonhosen94@gmail.com](mailto:mdlimonhosen94@gmail.com)

---
*Built with ❤️ using Wails*
