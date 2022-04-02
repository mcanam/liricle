function render(container, data) {
    const fragment = document.createDocumentFragment();
    
    data.forEach((item, index) => {
        const node = document.createElement("div");
        
        node.className = "liricle-line";
        node.innerText = item.text || "";
        
        fragment.append(node);
    });
    
    container.innerHTML = "";
    container.append(fragment);
}

export default render;
