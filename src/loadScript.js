export function loadScript(scriptUrl, globalName) {
    if (globalName && window[globalName]) 
      return Promise.resolve();
  
    return new Promise((resolve, reject) => {
      let scr = document.createElement('script');
      scr.type = "text/javascript";
      scr.src = scriptUrl;
      document.getElementsByTagName('head')[0].appendChild(scr);
      scr.onload = (() => {
        !globalName || window[globalName] ? 
          resolve() : reject(Error('window.' + globalName + ' undefined'));
      });
      scr.onerror = () => reject(Error('Error loading ' + globalName||scriptUrl));
    });
  }