
export function getDemoHTMLContent() {
  return fetch("./demo.html").then(res => res.text())
}