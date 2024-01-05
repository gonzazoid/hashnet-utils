// https://html.spec.whatwg.org/multipage/indices.html#attributes-3
// https://stackoverflow.com/questions/2725156/complete-list-of-html-tag-attributes-which-have-a-url-value
// https://www.w3schools.com/tags/ref_attributes.asp
/*
action:
  form: think about it
formaction:
  button
  input
background:
  body
cite: CAN BE ANYTING
  blockquote
  del
  ins
  q
classid:
  object
codebase:
  object
  applet
data:
  object - depends on type
href:
  a      - most likely html but not always
  area   - like a
  base   - think about it!!!!
  link   - anything (html, css, files) (see rel & type attributes)
longdesc:
  img
  frame
  iframe
profile:
  head
src:
  audio  - file
  embed  - html/file (depends on type attribute)
  frame  - 
  iframe - html (can be just image??)
  img    - file
  input  - file
  script - file
  source - file
  track  - file
  video  - file
srcset
  source - file
  img    - multuple urls
itemid:
  ??? global attribute?
itemprop
itemtype
ping:
  a
  area
poster:
  video
embed, link, object, script, source, style -> type = MIME

*/

/*
{
  [file's full path]: {
    handler: promise
    digests: {
      [hashFunc]: value
    }
  }
}
*/

const mimeTypesOfRefs = {
  src: {
    audio: "application/octet-stream",
    embed: "depends",
    frame: "depends", 
    iframe: "depends",
    img: "application/octet-stream",
    input: "application/octet-stream",
    script: "application/octet-stream",
    source: "application/octet-stream",
    track: "application/octet-stream",
    video: "application/octet-stream",
  },
  href: {
    link: "depends",
    a: "depends",
  }
};

const refineMimeType = (element, attributeName, localPath) => {
  if (element.rawTagName === "link" && element.getAttribute("rel") === "stylesheet") return "text/css";
  if (element.rawTagName === "a" && attributeName === "href") return "text/html"; // TODO we should look into file do check if it's really html

  return "application/octet-stream";
};

const getMimeTypeOfRef = (element, attributeName, localPath) => {
  const tagName = element.rawTagName;
  const mimeType = mimeTypesOfRefs[attributeName][tagName];
  if (mimeType === undefined) return "application/octet-stream";
  if (mimeType === "depends") return refineMimeType(element, attributeName, localPath);
  return mimeType;
};

export default getMimeTypeOfRef;
