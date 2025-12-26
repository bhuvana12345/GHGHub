// GFGHub Content Script - Uses ACE Editor
(function() {
  'use strict';
  console.log('🚀 GFGHub: Extension loaded');

  let lastSubmittedCode = '';
  let isProcessing = false;
  let aceReady = false;

  // Wait for ACE editor to load
  function waitForAce() {
    const checkAce = setInterval(() => {
      if (window.ace && window.ace.edit) {
        aceReady = true;
        console.log('✓ ACE editor detected and ready');
        clearInterval(checkAce);
      }
    }, 500);
    setTimeout(() => clearInterval(checkAce), 30000);
  }

  function getProblemTitle() {
    const selectors = ['.problems_header_content__title__L2cB2', '.problem-title', 'h1'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim().length > 3) return el.textContent.trim();
    }
    return 'Unknown Problem';
  }

  function getProblemStatement() {
    const el = document.querySelector('.problems_problem_content__Xb_eO');
    if (el) {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('script, style').forEach(e => e.remove());
      return clone.innerText.trim();
    }
    return 'Problem statement not available';
  }

  function getDifficulty() {
    const el = document.querySelector('.problems_tag_container__kWANg span');
    if (el) {
      const text = el.textContent.trim();
      if (text.match(/Easy|Medium|Hard|Basic/i)) return text;
    }
    return 'Medium';
  }

  function getTags() {
    const tags = document.querySelectorAll('.problems_tag_container__kWANg a');
    return Array.from(tags).map(t => t.textContent.trim());
  }

  function getExamples() {
    const examples = [];
    document.querySelectorAll('.example, pre').forEach(el => {
      const text = el.textContent.trim();
      if (text.includes('Input:') || text.includes('Output:')) {
        examples.push(text);
      }
    });
    return examples.length > 0 ? examples.join('\n\n') : 'See problem link';
  }

  function getCode() {
    console.log('🔍 Trying to capture code from ACE editor...');
    
    // Method 1: Try to get ACE editor instance
    if (window.ace && aceReady) {
      try {
        // Find all ACE editor elements
        const editors = document.querySelectorAll('.ace_editor');
        console.log('Found ACE editor elements:', editors.length);
        
        for (let i = 0; i < editors.length; i++) {
          const editorEl = editors[i];
          const editor = window.ace.edit(editorEl);
          if (editor) {
            const code = editor.getValue();
            console.log('Editor', i, 'code length:', code.length);
            if (code && code.trim().length > 10) {
              console.log('✓ Code found from ACE editor', i);
              return code;
            }
          }
        }
      } catch (e) {
        console.log('Error getting ACE editor:', e);
      }
    }
    
    // Method 2: Try view-lines (visual representation)
    const viewLines = document.querySelector('.ace_text-layer');
    if (viewLines) {
      const lines = viewLines.querySelectorAll('.ace_line');
      console.log('Found ace_line elements:', lines.length);
      if (lines.length > 0) {
        const code = Array.from(lines).map(line => line.textContent).join('\n');
        if (code && code.trim().length > 10) {
          console.log('✓ Code found from ace_line elements');
          return code;
        }
      }
    }
    
    // Method 3: Try textareas as fallback
    const textareas = document.querySelectorAll('textarea');
    console.log('Found textareas:', textareas.length);
    for (let textarea of textareas) {
      if (textarea.value && textarea.value.trim().length > 10) {
        console.log('✓ Code found from textarea');
        return textarea.value;
      }
    }
    
    console.log('✗ Could not find code');
    return '';
  }

  function getLanguage() {
    const langButton = document.querySelector('[class*="lang"]');
    if (langButton) {
      const text = langButton.textContent.toLowerCase();
      if (text.includes('cpp') || text.includes('c++')) return 'cpp';
      if (text.includes('java')) return 'java';
      if (text.includes('python')) return 'python';
      if (text.includes('javascript')) return 'javascript';
    }
    return 'cpp';
  }

  function getFileExtension(lang) {
    const ext = {'cpp': 'cpp', 'java': 'java', 'python': 'py', 'javascript': 'js'};
    return ext[lang.toLowerCase()] || 'txt';
  }

  function formatFilename(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50);
  }

  function createReadme(data) {
    const tagList = data.tags.length > 0 ? data.tags.map(t => '`' + t + '`').join(', ') : 'No tags';
    return '# ' + data.title + '\n\n' +
           '**Difficulty:** ' + data.difficulty + '\n' +
           '**Problem Link:** [View on GeeksforGeeks](' + data.url + ')\n' +
           '**Date Solved:** ' + data.date + '\n' +
           '**Language:** ' + data.language + '\n\n' +
           '## Tags\n' + tagList + '\n\n---\n\n' +
           '## Problem Statement\n\n' + data.problemStatement + '\n\n---\n\n' +
           '## Examples\n\n' + data.examples + '\n\n---\n\n' +
           '## Solution\n\n```' + data.language + '\n' + data.code + '\n```\n\n---\n\n' +
           '*Last Updated: ' + data.date + '*\n*Synced by GFGHub*\n';
  }

  function setupSubmissionMonitor() {
    document.addEventListener('click', function(event) {
      const target = event.target;
      const isSubmit = target.textContent.includes('Submit') || 
                       target.classList.contains('submit-btn') ||
                       (target.closest('button') && target.closest('button').textContent.includes('Submit'));
      
      if (isSubmit) {
        console.log('🔍 GFGHub: Submit button clicked');
        setTimeout(() => {
          lastSubmittedCode = getCode();
          console.log('📝 Code captured on click, length:', lastSubmittedCode.length);
        }, 1000);
      }
    }, true);
    
    observeForSuccess();
  }

  function observeForSuccess() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) checkForSuccess(node);
        }
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
  }

  function checkForSuccess(node) {
    const text = node.textContent || '';
    const keywords = ['Correct Answer', 'Problem Solved Successfully', 'All test cases passed', 'Accepted'];
    const hasSuccess = keywords.some(k => text.includes(k));
    
    if (hasSuccess && !isProcessing) {
      console.log('✅ GFGHub: Success detected!');
      setTimeout(() => collectAndSubmit(), 3000);
    }
  }

  async function collectAndSubmit() {
    if (isProcessing) return;
    isProcessing = true;
    console.log('📦 Collecting data...');
    
    let code = lastSubmittedCode || getCode();
    
    if (!code || code.trim().length < 10) {
      console.error('❌ No code found. Waiting and trying again...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      code = getCode();
      
      if (!code || code.trim().length < 10) {
        console.error('❌ Still no code found. Aborting.');
        showNotification('❌ Could not capture code', 'error');
        isProcessing = false;
        return;
      }
    }
    
    console.log('✓ Code captured successfully, length:', code.length);
    
    const title = getProblemTitle();
    const language = getLanguage();
    const date = new Date().toISOString().split('T')[0];
    const filename = formatFilename(title);
    const extension = getFileExtension(language);
    
    const readmeContent = createReadme({
      title: title,
      problemStatement: getProblemStatement(),
      difficulty: getDifficulty(),
      language: language,
      tags: getTags(),
      examples: getExamples(),
      url: window.location.href,
      date: date,
      code: code
    });
    
    const dataToSend = {
      filename: filename + '.' + extension,
      code: code,
      readme: readmeContent,
      title: title,
      difficulty: getDifficulty(),
      language: language
    };
    
    console.log('📤 Sending to GitHub...');
    
    chrome.runtime.sendMessage({action: 'submitToGitHub', data: dataToSend}, (response) => {
      isProcessing = false;
      if (chrome.runtime.lastError) {
        console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
        showNotification('❌ Extension error', 'error');
      } else if (response && response.success) {
        console.log('✅ Successfully pushed to GitHub!');
        showNotification('✅ Solution pushed to GitHub!', 'success');
      } else {
        console.error('❌ Failed:', response?.error);
        showNotification('❌ Failed: ' + (response?.error || 'Unknown error'), 'error');
      }
    });
  }

  function showNotification(message, type) {
    const existing = document.getElementById('gfghub-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'gfghub-notification';
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:' + 
      (type === 'success' ? '#2ecc71' : '#e74c3c') + 
      ';color:white;padding:15px 25px;border-radius:8px;z-index:999999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-weight:bold';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }

  function init() {
    console.log('🎯 GFGHub initialized');
    waitForAce();
    setupSubmissionMonitor();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
