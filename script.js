const mainElm = document.getElementById("main");
const blogProtocolHostnameElm = document.getElementById(
  "blog-protocol-hostname"
);

const numPostsElm = document.getElementById("num-posts");
const searchElm = document.getElementById("search");
const fullBlogFeedURLElm = document.getElementById("full-blog-feed-url");
const formEl = document.getElementById("form");
const showBlogBookBtn = document.getElementById("show-blog-book");
const blogFeedReqFinalElm = document.getElementById("blog-feed-req-final");
const formAlertElm = document.getElementById("form-alert");
let encodedFeedReqURL = "";

function handleFeed({ feed }) {
  console.log("feed");
  console.log(feed);
  if (feed) {
    formAlertElm.innerHTML =
      "Script got loaded successfully and handleFeed callback was invoked.";
  } else {
    formAlertElm.innerHTML =
      "Loading script failed! Script did not return expected feed property. handleFeed callback is aborting!";
    return;
  }
  let bookHeaderHTML = "";
  let contentHTML = "";
  let tableOfContentsHTML = "";
  bookHeaderHTML +=
    `<button id="save-btn" class="save-btn" 
    onclick="handleSaveClick()">Save Blogbook</button>` +
    '<hr style="border: 2px solid black;">';
  bookHeaderHTML += "<h1>Blog Feed To HTML Book</h1>";
  bookHeaderHTML += `<h2>Blog Title: ${feed.title.$t}</h2>`;
  bookHeaderHTML += `<h2>Blog Description: ${feed.subtitle.$t}</h2>`;

  if (feed.link[2].rel === "alternate") {
    bookHeaderHTML += `<h2>Blog Address: ${feed.link[2].href}</h2>`;
  }

  const blogLastUpdatedDate = new Date(feed.updated.$t);
  bookHeaderHTML += `<p>Blog last updated: ${blogLastUpdatedDate.toString()}</p>`;

  bookHeaderHTML += `<p>Blog feed script src URI: ${encodedFeedReqURL}</p>`;
  if (feed.openSearch$totalResults.$t === "0") {
    bookHeaderHTML += `<p>Number of posts returned: 0</p>`;
  } else if (feed.entry) {
    tableOfContentsHTML = "<h1>Contents (Posts) Internal Links</h1>";
    bookHeaderHTML += `<p>Number of posts returned: ${feed.entry.length}</p>`;
    const now = new Date();
    bookHeaderHTML += `<p>Blog book creation date & time: ${now.toString()}</p><hr/><hr/><hr/>`;
    let postURL = "";
    let postTitle = "";
    let publishedDate, updatedDate;
    for (i in feed.entry) {
      const oneContentLinkHTML = `<a href="#entry-${i}" target="_self">${
        feed.entry[i].title.$t
      }</a>
      <span>Published: ${feed.entry[i].published.$t.slice(
        0,
        10
      )}, Updated: ${feed.entry[i].updated.$t.slice(0, 10)}</span><br/><br/>`;
      tableOfContentsHTML += oneContentLinkHTML;
      if (feed.entry[i].link[4].rel === "alternate") {
        postURL = feed.entry[i].link[4].href;
        postTitle = `<a href="${postURL}">${feed.entry[i].title.$t}</a>`;
      } else {
        postURL = "";
        postTitle = feed.entry[i].title.$t;
      }
      publishedDate = new Date(feed.entry[i].published.$t);
      updatedDate = new Date(feed.entry[i].updated.$t);
      contentHTML +=
        `<h1 id="entry-${i}">` +
        postTitle +
        "</h1>" +
        "<p>Published: " +
        publishedDate.toString() +
        "</p>" +
        "<p>Updated: " +
        updatedDate.toString() +
        "</p>" +
        "<hr />" +
        feed.entry[i].content.$t +
        "<hr />" +
        "<hr />";
    }
    tableOfContentsHTML += "<hr /><hr /><hr />";
    contentHTML += `<h2>***** End of Blog Book *****</h2>`;
  } else {
    contentHTML +=
      "<h2>Unexpected response from script and so cannot create blog book.</h2>";
  }

  // Why is below SetTimeout needed?
  // From https://developer.mozilla.org/en-US/docs/Web/API/Window/open :
  // "Remote URLs won't load immediately. When window.open() returns, the window always contains about:blank.
  // The actual fetching of the URL is deferred and starts after the current script block finishes executing.
  // The window creation and the loading of the referenced resource are done asynchronously."
  // Without SetTimeout it seems that the body of the new document is not yet setup when the
  // body's innerHTML is assigned the value below. So when the new window opens it shows only the static
  // contents of blogbook.html! Having a timeout results in the body of the new document set up correctly
  // and so below code value assignment to body works as expected.
  // const newWindow = window.open("blogbook.html");
  const newWindow = window.open("blogbook.html", "BlogbookWin");
  setTimeout(function () {
    newWindow.document.body.innerHTML =
      '<main id="main" class="main-book">' +
      bookHeaderHTML +
      tableOfContentsHTML +
      contentHTML +
      "</main>";
  }, 1000); // Delay of 1 second works
  // }, 0); // Delay of 0 seconds does not work

  // There is an interesting possibility of opening the blogbook window immediately after we get the data
  // from script and then add to the contents of the blogbook post by post instead of doing it all at once.
  // But that is more programming work and I am not ready now to spend time on that.
  // Further I don't know whether it will make a visible performance impact. If there is a delay in
  // blogbook creation, the main reason would typically be delay in script returning (with callback being
  // invoked with the data)
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  formAlertElm.innerHTML = "";
  let numPosts = numPostsElm.value;
  if (numPosts === "") numPosts = 0;
  encodedFeedReqURL = "";
  if (fullBlogFeedURLElm.value != "") {
    encodedFeedReqURL += fullBlogFeedURLElm.value;
  } else {
    encodedFeedReqURL +=
      blogProtocolHostnameElm.value + "feeds/posts/default/?";
    if (numPosts > 0) {
      encodedFeedReqURL += "max-results=" + numPosts + "&";
    }
    if (searchElm.value != "") {
      encodedFeedReqURL += "q=" + encodeURIComponent(searchElm.value) + "&";
    }
    encodedFeedReqURL += "alt=json-in-script&callback=handleFeed";
  }
  encodedFeedReqURL = encodedFeedReqURL.trimEnd();
  console.log(encodedFeedReqURL);
  blogFeedReqFinalElm.innerHTML = encodedFeedReqURL;

  formAlertElm.innerHTML = "Loading script ...";
  const script = document.createElement("script");
  script.src = encodedFeedReqURL;
  script.onerror = function () {
    formAlertElm.innerHTML = `Loading script failed! Check final blog feed request given above.
       One reason could be wrong Blogger blog hostname with protocol.`;
  };
  document.body.appendChild(script);
});
