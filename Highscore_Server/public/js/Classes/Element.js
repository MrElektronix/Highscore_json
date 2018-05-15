class Element {
    constructor(){}

    _createElement(element){
        let elem = document.createElement(element);
        return elem;
    }

    _appendToElementByID(element, id){
        document.getElementById(id).appendChild(element);
    }

    _appendToElement(element1, element2){
        element1.appendChild(element2)
    }

    _appendToBody(element){
        document.body.appendChild(element);
    }

    AddText(element, text){
        let t = document.createTextNode(text);
        element.appendChild(t);
    }
}