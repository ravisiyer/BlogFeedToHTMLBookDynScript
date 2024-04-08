function writeBook(htmlContent) {
  // Ref: https://www.quora.com/How-do-you-save-a-HTML-file-dynamically-with-JavaScript-JavaScript-HTML-development
  // Create a new Blob object with the HTML content
  var blob = new Blob([htmlContent], { type: "text/html" });

  // Create a temporary URL for the blob
  var url = URL.createObjectURL(blob);

  // Create a link element
  var link = document.createElement("a");
  link.download = "blogbook.html";
  link.href = url;

  // Append the link to the document body
  document.body.appendChild(link);

  // Trigger a click event on the link to prompt the download
  link.click();

  // Clean up
  document.body.removeChild(link);
}

// export default writeBook;
// module.exports = { writeBook };
