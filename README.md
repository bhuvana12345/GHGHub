# GHGHub

Automatically sync your GeeksforGeeks problem solutions to GitHub! Never lose your coding progress again.

## Features

- **Automatic Sync**: Automatically pushes your accepted solutions to GitHub
- **Smart Detection**: Detects when you submit and pass a problem
- **Organized Structure**: Creates a clean folder structure by difficulty level
- **Detailed README**: Generates README files with problem statement, examples, and tags
- **Multiple Languages**: Supports C++, Java, Python, JavaScript, and more
- **Real-time Notifications**: Shows success/error notifications

## Installation

1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `GFGHub` folder
6. The extension is now installed!

## Setup

1. Click the GFGHub extension icon in your browser toolbar
2. Enter your GitHub credentials:
   - **Username**: Your GitHub username
   - **Repository Name**: Target repository name
   - **GitHub Token**: [Generate a Personal Access Token](https://github.com/settings/tokens)
     - Click "Generate new token (classic)"
     - Give it a name like "GFGHub"
     - Check the **`repo`** permission
     - Copy the token
3. Click **Test Connection** to verify
4. Click **Save Settings**

## Usage

1. Go to any GeeksforGeeks problem page
2. Write your solution
3. Click **Submit**
4. When your solution is accepted, it automatically syncs to GitHub!
5. Check your repository - you'll see your solution organized by difficulty

## Repository Structure
```
GeeksforGeeks-DSA/
└── GeeksforGeeks/
    ├── Easy/
    │   └── subarray-with-given-sum/
    │       ├── subarray-with-given-sum.cpp
    │       └── README.md
    ├── Medium/
    │   └── longest-substring-without-repeating/
    │       ├── longest-substring-without-repeating.py
    │       └── README.md
    └── Hard/
        └── median-of-two-sorted-arrays/
            ├── median-of-two-sorted-arrays.java
            └── README.md
```

## What Gets Saved

For each problem, the extension creates:
- **Solution file**: Your code in the appropriate language extension
- **README.md**: Contains problem title, difficulty, statement, examples, solution, tags, and date solved

## Troubleshooting

### Extension not detecting code
- Make sure you're on `practice.geeksforgeeks.org`
- Refresh the page after installing the extension
- Check the browser console (F12) for debug messages

### GitHub push failing
- Verify your Personal Access Token has `repo` permissions
- Check that your repository exists and is spelled correctly
- Make sure you've saved your settings in the extension popup

### Code not captured
- Wait for "✓ ACE editor detected and ready" message in console
- Try submitting again
- Check that your code is more than 10 characters

## Technical Details

- **Manifest Version**: 3
- **Editor Support**: ACE Editor (used by GeeksforGeeks)
- **Permissions**: storage, activeTab, scripting
- **Host Permissions**: GeeksforGeeks domains, GitHub API

## Author

Created by Bhuvana Korrapati

---

**Happy Coding!**
