'use strict';

// Blocking
function handleRequest(details){
  return { redirectUrl: `chrome-extension://${chrome.runtime.id}/blocked.html`}
}

function addBlockingListener(urls){
  chrome.webRequest.onBeforeRequest.addListener(handleRequest, { urls, }, ["blocking"]);
}

// Storage
function clearStorage() {
  chrome.storage.local.clear(function () {
    chrome.webRequest.onBeforeRequest.removeListener(handleRequest)
    console.log('Storage clear')
  })
}

function loadBannedURLs() {
  chrome.storage.local.get('blocked', (result) => {
    if (!result.blocked) { return; }
    for (let url of result.blocked) {
      addBlockingListener([url])
    }
  })
}

function saveBannedURL(url){
  chrome.storage.local.get('blocked', (result) => {
    if (!result.blocked) { result.blocked = [] }
    result.blocked.push(url)
    chrome.storage.local.set({'blocked': result.blocked})
  })
}

// Core feature
function addBannedURL(url){
  addBlockingListener([url])
  saveBannedURL(url)
}

chrome.runtime.onMessage.addListener((msg) => {
  switch(msg.type){
    case 'clearStorage':
      clearStorage()
    case 'block':
      addBannedURL(`*://*.${msg.data}/*`)
    default:
      break
  }
});

loadBannedURLs()