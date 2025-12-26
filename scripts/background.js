console.log('🚀 GFGHub Background Script Loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'submitToGitHub') {
    console.log('📨 Received submission request');
    handleGitHubSubmission(request.data)
      .then((result) => {
        console.log('✅ GitHub submission successful');
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        console.error('❌ GitHub submission failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function handleGitHubSubmission(data) {
  console.log('🔧 Processing submission for:', data.title);
  const settings = await chrome.storage.sync.get(['githubToken', 'repoName', 'username']);
  if (!settings.githubToken || !settings.repoName || !settings.username) {
    throw new Error('⚠️ GitHub credentials not configured');
  }
  const { githubToken, repoName, username } = settings;
  const folderPath = `GeeksforGeeks/${data.difficulty}/${data.filename.replace(/\.[^/.]+$/, '')}`;
  console.log('📁 Folder path:', folderPath);
  try {
    console.log('📤 Uploading code file...');
    await uploadToGitHub(username, repoName, `${folderPath}/${data.filename}`, data.code, githubToken, `✨ Add solution: ${data.title}`);
    console.log('📤 Uploading README...');
    await uploadToGitHub(username, repoName, `${folderPath}/README.md`, data.readme, githubToken, `📝 Add README: ${data.title}`);
    console.log('✅ All files uploaded');
    return { success: true };
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

async function uploadToGitHub(owner, repo, path, content, token, message) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  console.log('🌐 GitHub API URL:', url);
  let sha = null;
  try {
    const checkResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GFGHub-Extension'
      }
    });
    if (checkResponse.ok) {
      const existingFile = await checkResponse.json();
      sha = existingFile.sha;
      console.log('📄 File exists, will update. SHA:', sha);
    } else {
      console.log('📄 File does not exist, will create');
    }
  } catch (error) {
    console.log('📄 File check failed');
  }
  const body = {
    message: message,
    content: btoa(unescape(encodeURIComponent(content))),
    ...(sha && { sha: sha })
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GFGHub-Extension'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ GitHub API Error:', errorData);
    throw new Error(`GitHub API error: ${errorData.message || 'Unknown error'}`);
  }
  const result = await response.json();
  console.log('✅ File uploaded:', result.content.name);
  return result;
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎉 GFGHub installed!');
    chrome.action.openPopup();
  } else if (details.reason === 'update') {
    console.log('🔄 GFGHub updated!');
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 GFGHub service worker started');
});
