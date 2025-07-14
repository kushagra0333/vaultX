# 🔐 Vault - File Converter App

**Vault** is a secure, full-featured file conversion and management platform. It offers seamless format conversion, user authentication, file storage, and management with a sleek UI — all while maintaining performance and security.

---

### ✅ Features

- 🔄 **Real Format Conversion** (PDF ⇄ DOCX, HTML, TXT, Image, Audio, Video, etc.)
- 🔐 **User Authentication**
  - Signup with email & password
  - Login with session handling
  - Password change with validation
- 📂 **File Management**
  - Upload and convert multiple files
  - View uploaded file history
  - Delete files securely
- ⚡ Fast, secure API (no file storage on server)
- 🌐 Modern responsive UI with drag & drop support

---

### 🛠 Tech Stack

- **Frontend**: Next.js (App Router), React
- **Styling**: Tailwind CSS
- **Backend**: Node.js (Next.js API Routes)
- **Authentication**: JWT + Bcrypt
- **Database**: MongoDB (Mongoose)
- **Conversion Libraries**: `pdf-lib`, `mammoth`, `html-to-text`, `sharp`, `ffmpeg`, `unzipper`

---

### ⚙️ Setup

```bash
git clone https://github.com/your-username/vault.git
cd vault
npm install
npm run dev
````

Visit: `https://vault-x-blond.vercel.app/`

Set up a `.env.local` file:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

### 👤 Auth & Account Features

| Feature            | Description                                      |
| ------------------ | ------------------------------------------------ |
| 🔐 Signup          | Create an account with email and password        |
| 🔓 Login           | Secure session login                             |
| 🔁 Change Password | Update existing password with old password check |
| 🚪 Logout          | Ends the session securely                        |

---

### 📁 File Upload & Management

| Feature    | Description                                      |
| ---------- | ------------------------------------------------ |
| ⬆️ Upload  | Upload single or multiple files for conversion   |
| 🔄 Convert | Automatically converts files to selected formats |
| 🗑️ Delete | Users can delete previously uploaded files       |
| 📜 History | Shows recent uploads and conversions per account |

---
### 🔁 Supported Conversions

#### 📝 Document Formats
| Source | Converts To |
|--------|-------------|
| PDF    | DOCX, TXT, ODT, RTF, HTML, EPUB, PPTX, ODP, XLSX, ODS |
| DOCX   | PDF, TXT, ODT, RTF, HTML, EPUB |
| ODT    | PDF, DOCX, TXT, RTF, HTML |
| RTF    | PDF, DOCX, TXT, ODT, HTML |
| TXT    | PDF, DOCX, ODT, RTF, HTML, MD |
| MD     | PDF, DOCX, TXT, HTML |
| HTML   | PDF, DOCX, TXT, MD |
| EPUB   | PDF, DOCX, TXT |

#### 📊 Spreadsheet Formats
| Source | Converts To |
|--------|-------------|
| CSV    | PDF, XLSX, ODS |
| XLSX   | PDF, CSV, ODS |
| ODS    | PDF, CSV, XLSX |

#### 🎤 Presentation Formats
| Source | Converts To |
|--------|-------------|
| PPTX   | PDF, ODP |
| ODP    | PDF, PPTX |

#### 🖼️ Image Formats
| Source | Converts To |
|--------|-------------|
| JPG/JPEG | PNG, WEBP, BMP, GIF, PDF |
| PNG    | JPG, WEBP, BMP, GIF, PDF |
| GIF    | JPG, PNG, WEBP, BMP, PDF |
| BMP    | JPG, PNG, WEBP, GIF, PDF |
| WEBP   | JPG, PNG, BMP, GIF, PDF |

#### 🔊 Audio Formats
| Source | Converts To |
|--------|-------------|
| MP3    | WAV, OGG, AAC, FLAC |
| WAV    | MP3, OGG, AAC, FLAC |
| OGG    | MP3, WAV, AAC, FLAC |
| AAC    | MP3, WAV, OGG, FLAC |
| FLAC   | MP3, WAV, OGG, AAC |

#### 🎥 Video Formats
| Source | Converts To |
|--------|-------------|
| MP4    | MOV, AVI, WEBM, MKV |
| MOV    | MP4, AVI, WEBM, MKV |
| AVI    | MP4, MOV, WEBM, MKV |
| WEBM   | MP4, MOV, AVI, MKV |
| MKV    | MP4, MOV, AVI, WEBM |

#### 📦 Archive Formats
| Source | Converts To |
|--------|-------------|
| ZIP    | TAR, GZ, 7Z |
| TAR    | ZIP, GZ, 7Z |
| GZ     | ZIP, TAR, 7Z |
| 7Z     | ZIP, TAR, GZ |

#### 💻 Code/Text Formats
| Source | Converts To |
|--------|-------------|
| SH     | TXT |
| PY     | TXT |
| JS     | TXT |
| JSON   | TXT |
| XML    | TXT |

---

#### 📊 Spreadsheet, 🎤 Presentation, 🖼️ Image, 🔊 Audio, 🎥 Video, 📦 Archive, 💻 Code Formats

*See full table [here](#-supported-conversions) – All major formats covered.*

---

### 🔐 Security & Architecture

* Files processed in-memory, **never stored on server**
* JWT-based **secure auth system**
* Passwords hashed using **bcrypt**
* API protected via **middleware validation**
* MongoDB stores only **user + file metadata** (not actual files)

---

### 📄 License

MIT © 2025 Kushagra Pandey

