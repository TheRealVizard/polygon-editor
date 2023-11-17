document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("include").forEach(async (element) => {
        const content = await fetch(
            element.attributes.getNamedItem("src").value
        ).then((resp) => {
            return resp.text();
        });
        const parentNode = element.parentNode;
        parentNode.removeChild(element);
        parentNode.innerHTML += content;
    });
});
