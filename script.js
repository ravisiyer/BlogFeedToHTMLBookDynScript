const mainElm = document.getElementById("main");
const blogProtocolHostnameElm = document.getElementById(
  "blog-protocol-hostname"
);

const numPostsElm = document.getElementById("num-posts");
const searchElm = document.getElementById("search");
const daysElm = document.getElementById("days");
const dateRangeTypeElm = document.getElementById("date-range-type");
const fullBlogFeedURLElm = document.getElementById("full-blog-feed-url");
const formEl = document.getElementById("form");
const showBlogBookBtn = document.getElementById("show-blog-book");
const blogFeedReqFinalElm = document.getElementById("blog-feed-req-final");
const formAlertElm = document.getElementById("form-alert");
let encodedFeedReqURL = "";
let blogbookMainHTML = "";
let newWindow;
console.log(`window.name = ${window.name}`);
window.name = "BBIndex";
console.log(`set window.name to ${window.name}`);

window.onload = function () {
  const searchParams = new URLSearchParams(window.location.search);
  for (const param of searchParams) {
    console.log(param);
  }
  if (searchParams.has("blog-address")) {
    if (blogProtocolHostnameElm) {
      blogProtocolHostnameElm.value = searchParams.get("blog-address");
    }
  }
  if (searchParams.has("max-posts")) {
    if (numPostsElm) {
      numPostsElm.value = searchParams.get("max-posts");
    }
  }
  if (searchParams.has("search")) {
    if (searchElm) {
      searchElm.value = searchParams.get("search");
    }
  }
  if (searchParams.has("last-days-type")) {
    if (dateRangeTypeElm) {
      const lastDaysType = searchParams.get("last-days-type");
      const lcLastDaysType = lastDaysType.toLowerCase();
      if (lcLastDaysType === "updated" || lcLastDaysType === "published") {
        dateRangeTypeElm.value = lcLastDaysType;
      }
    }
  }
  if (searchParams.has("last-days-period")) {
    if (daysElm) {
      daysElm.value = searchParams.get("last-days-period");
    }
  }
  if (searchParams.has("full-blog-feed-uri")) {
    if (fullBlogFeedURLElm) {
      fullBlogFeedURLElm.value = searchParams.get("full-blog-feed-uri");
    }
  }
};
function updateBlogbookPage() {
  console.log("updateBlogbookPage function called");
  if (!newWindow) {
    console.log("Blogbook window not defined");
    return false;
  }

  if (!newWindow.document) {
    console.log("Blogbook window defined but its document not defined");
    return false;
  }

  if (!newWindow.document.body) {
    console.log(
      "Blogbook window and its document defined but its document.body not defined"
    );
    return false;
  }
  newWindow.document.body.innerHTML = blogbookMainHTML;
  return true;
}

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

  bookHeaderHTML +=
    "<p>Blog book created by " +
    '<a href="https://raviswdev.blogspot.com/2024/04/barebones-blogger-blog-feed-to-html.html">' +
    "Blogger Feed to HTML Book App</a> on ";
  const now = new Date();
  bookHeaderHTML += `${now.toString()}</p>`;

  bookHeaderHTML += `<p>Blog feed script src URI: ${encodedFeedReqURL}</p>`;

  if (feed.openSearch$totalResults.$t === "0") {
    bookHeaderHTML += `<p>Number of posts returned: 0</p>`;
  } else if (feed.entry) {
    bookHeaderHTML += `<p>Number of posts returned: ${feed.entry.length}</p>`;
    bookHeaderHTML += `<hr/><hr/><hr/>`;
    tableOfContentsHTML = "<h1>Contents (Posts) Internal Links</h1>";
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
      if (
        feed.entry[i].link.length > 4 &&
        feed.entry[i].link[4].rel === "alternate"
      ) {
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

  newWindow = window.open("blogbook.html", "BlogbookWin");

  blogbookMainHTML =
    '<main id="main" class="main-book">' +
    bookHeaderHTML +
    tableOfContentsHTML +
    contentHTML +
    "</main>";

  // There is an interesting possibility of opening the blogbook window immediately after we get the data
  // from script and then add to the contents of the blogbook post by post instead of doing it all at once.
  // But that is more programming work and I am not ready now to spend time on that.
  // Further I don't know whether it will make a visible performance impact. If there is a delay in
  // blogbook creation, the main reason would typically be delay in script returning (with callback being
  // invoked with the data)
}

function getDateRangeQS(days, dateRangeType) {
  const today = new Date();
  let oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - days);
  const oldDateQS = dateRangeType + "-min=" + oldDate.toISOString();
  const todayQS = dateRangeType + "-max=" + today.toISOString();
  const dateRangeQS = oldDateQS + "&" + todayQS;
  return dateRangeQS;
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  formAlertElm.innerHTML = "";
  blogFeedReqFinalElm.innerHTML = "";
  let blogAddress = blogProtocolHostnameElm.value;
  if (!blogAddress.includes(":") && !blogAddress.includes("//")) {
    blogAddress = "https://" + blogAddress;
    blogProtocolHostnameElm.value = blogAddress;
  }
  try {
    new URL(blogAddress);
  } catch (error) {
    formAlertElm.innerHTML = `Blog address is invalid.`;
    return;
  }
  if (!blogAddress.endsWith("/")) {
    blogAddress += "/";
  }
  let numPosts = numPostsElm.value;
  if (numPosts === "") numPosts = 0;
  let days = daysElm.value;
  let dateRangeQueryString = "";
  let dateRangeType = dateRangeTypeElm.value;
  if (days === "") {
    days = 0;
  }
  if (days > 0) {
    if (searchElm.value !== "") {
      if (
        !confirm(
          "Blogger seems to ignore date range if search is specified in feed request.\n" +
            "You have specified search as well as date range. Proceed with request (OK) or Cancel?"
        )
      ) {
        return;
      }
    }
    dateRangeQueryString = getDateRangeQS(days, dateRangeType);
  }
  encodedFeedReqURL = "";
  if (fullBlogFeedURLElm.value !== "") {
    encodedFeedReqURL += fullBlogFeedURLElm.value;
  } else {
    encodedFeedReqURL += blogAddress + "feeds/posts/default/?";
    if (numPosts > 0) {
      encodedFeedReqURL += "max-results=" + numPosts + "&";
    }
    if (searchElm.value !== "") {
      encodedFeedReqURL += "q=" + encodeURIComponent(searchElm.value) + "&";
    }
    if (dateRangeQueryString !== "") {
      encodedFeedReqURL += dateRangeQueryString + "&";
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
    formAlertElm.innerHTML = `Loading script failed! Check final blog feed request given below.
       One reason could be wrong Blogger blog hostname with protocol (blog address).`;
  };
  document.body.appendChild(script);
});
