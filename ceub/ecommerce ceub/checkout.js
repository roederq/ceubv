let listCart = [];
// pega dados do cookie

function checkCart(){
    var cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('listCart='));
        if(cookieValue){
            listCart = JSON.parse(cookieValue.split('=')[1]);
        }
}
checkCart();
addCartToHTML();
function addCartToHTML(){
    // limpa os dados padrão
    let listCartHTML = document.querySelector('.returnCart .list');
    listCartHTML.innerHTML = '';
    let totalQuantityHTML = document.querySelector('.totalQuantity');
    let totalPriceHTML = document.querySelector('.totalPrice');

    let totalQuantity = 0;
    let totalPrice = 0; 

    // se tiver produto no carrinho
    if(listCart){
        listCart.forEach(product => {
            if(product){
                let newCart = document.createElement('div');
                newCart.classList.add('item');
                newCart.innerHTML = 
                    `<img src="${product.image}">
                    <div class="info">
                        <div class="name">${product.name}</div>
                        <div class="price">R$${product.price}</div>
                    </div>
                    <div class="quantity">${product.quantity}</div>
                    <div class="returnPrice">R$${product.price * product.quantity}</div>`;
                listCartHTML.appendChild(newCart);
                totalQuantity = totalQuantity + product.quantity;
                totalPrice = totalPrice + (product.price * product.quantity);
            }
        })
    }
    totalQuantityHTML.innerText = totalQuantity;
    totalPriceHTML.innerText = 'R$' + totalPrice;
}