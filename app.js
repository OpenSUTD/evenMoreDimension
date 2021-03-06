/*
 ** GA for anonymously tracking eDimension downloads
 ** (to show school usefulness of extension)
 */
_gaq.push(['_setAccount', 'UA-84709766-1']);
_gaq.push(['_setAllowLinker', true]);
_gaq.push(['_trackPageview']);

/*
 ** CONSTANTS
 */

const EDIM_URL = 'https://edimension.sutd.edu.sg';
const FOLDER_DL_ICON_SRC = chrome.extension.getURL('/images/download.png');
const INDIV_DL_ICON_SRC = chrome.extension.getURL('/images/download.png');
const SUTD_SQ_LOGO_SRC =  chrome.extension.getURL('/images/sutd.png');

const TYPE_DOWNLOADABILITY = {
  document: true,
  file: true,
  folder: false,
  link: false
};

/*
 ** HELPER FUNCTIONS
 */

const getDownloadable = function(els) {
  const ensureCorrectType = function() {
      return TYPE_DOWNLOADABILITY[getType(this)];
  }

  const ensureNotTabAction = function() {
      return this.href && !this.href.match(/mode=.+#/);

  }

  return $(els)
    .filter(ensureCorrectType)
    .filter(ensureNotTabAction)
}

const getFolders = function(els) {
  return $(els).filter(function() {
    return getType(this) === 'folder';
  });
}

// types: document, file, folder, link
const getType = (el) => {
  el = $(el);
  const imgSrc = el.closest('li[id *=contentListItem]').children('img').attr('src');

  if (!imgSrc) return null; // (in)sanity check

  // extract type from imgSrc
  return imgSrc.replace(/\/.+\//, '').replace(/_on.+/, '');
}

const getLinkInfo = (el) => {
  el = $(el);

  const url = EDIM_URL + el.attr('href');
  const title = el.children('span').text() || el.text();

  return { url, title };
}


/*
 ** START (FURREAL)
 */

const getAllLinks = (el = $('body')) => {
    return $(el).find('#content_listContainer li a');
}

const allLinks = getAllLinks();

const downloadableLinks = getDownloadable(allLinks);
const folderLinks = getFolders(allLinks);


// Download All Btn
if ( downloadableLinks.length ) {
  const dlAllBtn = $(`<a id="yp-dl-all"><img src=${FOLDER_DL_ICON_SRC}></img></a>`);
  $('#pageTitleBar').append(dlAllBtn);

  dlAllBtn.click( (e) => {
    e.preventDefault();

    _gaq.push(['_trackEvent', 'Download', 'Request Page Download'])

    // handle links on current page
    downloadableLinks.each(function() {
      const {url, title} = getLinkInfo(this);
      _gaq.push(['_trackEvent', 'Download', 'from Page', title])
      chrome.runtime.sendMessage(url);
    });

    // handle folders on current page
    folderLinks.each(function() {
      const { url } = getLinkInfo(this);
      downloadFolder(url);
    });
  })
}

// add download icons for files/documents
downloadableLinks.each(function() {
  const {url, title} = getLinkInfo(this);

  const dlBtn = $(`<a href=${url} class='yp-dl' download><img src=${INDIV_DL_ICON_SRC}></img></a>`);
  dlBtn.click(() => { _gaq.push(['_trackEvent', 'Download', 'from File', title]) });

  $(this).prepend(dlBtn);
})

const downloadFolder = (url) => {
  $.get(url).then( (data) => {
    _gaq.push(['_trackEvent', 'Download', 'Request Folder Download'])
    const allLinks = getAllLinks(data);
    const dlLinks = getDownloadable(allLinks);

    dlLinks.each(function() {
      const {url, title} = getLinkInfo(this);
      _gaq.push(['_trackEvent', 'Download', 'from Folder', title])
      chrome.runtime.sendMessage(url);
    });

    const folderLinks = getFolders(allLinks);
    folderLinks.each(function() {
      const { url } = getLinkInfo(this);
      downloadFolder(url);
    });
  });
}

// add download icons for folders
folderLinks.each(function() {
  const { url } = getLinkInfo(this);

  const dlBtn = $(`<a href=${url} class='yp-dl' download><img src=${FOLDER_DL_ICON_SRC}></img></a>`);
  dlBtn.click((e) => {
    e.preventDefault();
    downloadFolder(url);
  });

  $(this).prepend(dlBtn);
})
