# iSTEAM AHEAD CMS - Complete Content Management System

A professional, no-code Content Management System for the iSTEAM AHEAD Early Learning Centre website.

## Features

✅ **Complete Admin Dashboard** - Edit all website content without coding
✅ **Multi-User Support** - Create admin and editor accounts
✅ **Real-time Updates** - Changes appear immediately on the website
✅ **Image Management** - Upload and manage images with drag-and-drop
✅ **Organized Content Sections:**
   - Hero banner and main content
   - About section and vision statement
   - Classroom rooms and age groups
   - STEAM program disciplines
   - Testimonials and parent reviews
   - Contact information
   - Navigation menu

## Getting Started

### Installation

1. **Navigate to project directory:**
   ```bash
   cd /home/user/Claude
   ```

2. **Install dependencies (already done):**
   ```bash
   npm install
   ```

### Running the System

#### Start the Backend Server
```bash
npm start
```
or for development with auto-reload:
```bash
npm run dev
```

Server will run on: `http://localhost:3001`

### Accessing the System

**Admin Dashboard:**
http://localhost:3001/admin

**Default Login:**
- Username: `admin`
- Password: `admin123`

**Website:**
http://localhost:3001

## Usage Guide

### Logging In
1. Go to http://localhost:3001/admin
2. Enter username and password
3. Click "Login"

### Editing Content

#### Hero Section
- Edit the main banner title, subtitle, and description
- Upload a hero banner image
- Changes appear immediately

#### About Section
- Update your center's vision and mission
- Edit descriptions and values

#### Rooms
- Add/edit/delete childcare rooms
- Specify age groups and capacity for each room
- Drag to reorder (if enabled)

#### STEAM Program
- Manage 5 STEAM disciplines
- Add descriptions for each discipline
- Reorder as needed

#### Testimonials
- Add parent testimonials with ratings
- Edit or delete existing testimonials
- Display rotates through your testimonials

#### Contact Information
- Update address, phone, email
- Edit opening hours

#### Navigation Menu
- Add/edit menu items
- Set URLs or section anchors

### User Management (Admin Only)
- Create new admin or editor accounts
- View all users
- Delete users (remove access)

### Publishing Changes
- Click "Publish Changes" button in sidebar
- Enter an optional message describing what changed
- Changes are saved to the system

## File Structure

```
/home/user/Claude/
├── server.js                 # Backend API server
├── package.json             # Dependencies
├── .env                     # Configuration
├── admin/
│   ├── index.html          # Admin dashboard interface
│   ├── app.js              # Dashboard functionality
│   └── styles.css          # Admin styling
├── css/
│   └── styles.css          # Website styling
├── js/
│   └── main.js             # Website functionality
├── data/
│   └── content.json        # Stored content
│   └── users.json          # User accounts
└── uploads/images/         # Uploaded images
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Create new user

### Content Management
- `GET /api/content` - Fetch all content
- `POST /api/content` - Save content (requires auth)
- `POST /api/upload` - Upload image (requires auth)
- `POST /api/publish` - Publish changes (requires auth)

### User Management (Admin Only)
- `GET /api/users` - List all users

## Data Storage

Content is stored in JSON files in the `data/` directory:
- `data/content.json` - All website content
- `data/users.json` - User accounts and credentials

These are plain text files that can be backed up or version-controlled.

## Security Notes

⚠️ **For Production Use:**
1. Change the JWT_SECRET in `.env` to a strong random string
2. Use HTTPS/SSL certificates
3. Set NODE_ENV=production
4. Restrict admin access with firewall rules
5. Regularly backup the `data/` folder
6. Use strong passwords for admin accounts

## Default Admin Account

**Username:** admin
**Password:** admin123

⚠️ **IMPORTANT:** Change this password immediately after first login!

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, you can change it in `.env`:
```
PORT=3002
```

### Images Not Uploading
- Check that `uploads/` folder exists and is writable
- Verify file size is under 10MB
- Ensure file format is JPG, PNG, or WebP

### Can't Login
- Clear browser cache and cookies
- Verify server is running: `http://localhost:3001`
- Check console for error messages

### Content Not Saving
- Ensure you have proper user role (admin or editor)
- Check that `data/` folder exists and is writable
- Look at server console for error messages

## Support & Updates

For issues or feature requests, contact the system administrator.

## License

proprietary - iSTEAM AHEAD Early Learning Centre
