document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['username', 'repoName', 'githubToken'], (items) => {
    if (items.username) { 
      document.getElementById('username').value = items.username; 
      document.getElementById('displayUsername').textContent = items.username; 
    }
    if (items.repoName) { 
      document.getElementById('repoName').value = items.repoName; 
      document.getElementById('displayRepo').textContent = items.repoName; 
    }
    if (items.githubToken) { 
      document.getElementById('githubToken').value = items.githubToken; 
    }
    if (items.username && items.repoName && items.githubToken) { 
      document.getElementById('currentSettings').style.display = 'block'; 
    }
  });
});

document.getElementById('settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const repoName = document.getElementById('repoName').value.trim();
  const githubToken = document.getElementById('githubToken').value.trim();
  
  if (!username || !repoName || !githubToken) { 
    showStatus('❌ Fill all fields', 'error'); 
    return; 
  }
  
  chrome.storage.sync.set({ username, repoName, githubToken }, () => {
    showStatus('✅ Saved!', 'success');
    document.getElementById('displayUsername').textContent = username;
    document.getElementById('displayRepo').textContent = repoName;
    document.getElementById('currentSettings').style.display = 'block';
  });
});

document.getElementById('testConnection').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const repoName = document.getElementById('repoName').value.trim();
  const githubToken = document.getElementById('githubToken').value.trim();
  
  if (!username || !repoName || !githubToken) { 
    showStatus('⚠️ Fill all fields', 'error'); 
    return; 
  }
  
  const testButton = document.getElementById('testConnection');
  testButton.disabled = true;
  testButton.textContent = '⏳ Testing...';
  
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      headers: { 
        'Authorization': `token ${githubToken}`, 
        'Accept': 'application/vnd.github.v3+json' 
      }
    });
    
    if (response.ok) { 
      showStatus('✅ Connection successful!', 'success'); 
    } else if (response.status === 404) { 
      showStatus('❌ Repo not found', 'error'); 
    } else if (response.status === 401) { 
      showStatus('❌ Invalid token', 'error'); 
    } else { 
      showStatus(`❌ Error: ${response.status}`, 'error'); 
    }
  } catch (error) { 
    showStatus('❌ Network error', 'error'); 
    console.error('Error:', error);
  } finally {
    testButton.disabled = false;
    testButton.textContent = '🔍 Test';
  }
});

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.style.display = 'block';
  setTimeout(() => { 
    statusEl.style.display = 'none'; 
  }, 5000);
}
