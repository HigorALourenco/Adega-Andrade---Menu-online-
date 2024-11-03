const menu = document.getElementById("menu") // menu
const cartBtn = document.getElementById("cart-btn") //botao do carrinho
const cartModal = document.getElementById("cart-modal") //div do modal
const cartItemsContainer = document.getElementById("cart-items") // itens dentro do carinho
const cartTotal = document.getElementById("cart-total") // total do carrinho
const checkoutBtn = document.getElementById("checkout-btn") // finalizar o carrinho
const closeModalBtn = document.getElementById("close-modal-btn") // botao fechar
const cartCounter = document.getElementById("cart-count") // quantidade dos itens no carrinho
const addressInput = document.getElementById("address") // campo do endereço
const addressWarn = document.getElementById("address-warn") // campo pedindo o endereço



let cart = []; /* array do carrinho começa vazio*/

//abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    cartModal.style.display = "flex"    /* esta função mostra o carrinho*/
    updateCartModal();
})

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event){
    if(event.target === cartModal){
        cartModal.style.display = "none"
    }
})

//botao de fechar dentro do modal
closeModalBtn.addEventListener("click", function(){
    cartModal.style.display = "none"
})

// botao icone do carrinho
menu.addEventListener("click", function(event){
    let parentButton = event.target.closest(".add-to-cart-btn")
    if (parentButton){
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))
        //Adicionar no carrinho.
        addToCart(name, price)

        
    }

})

//Função para adicionar no carrinho

function addToCart(name, price){
    const existingItem = cart.find(item => item.name === name)

    if(existingItem){
        //se o item já existe aumenta a quantidade, o find verifica
        existingItem.quantity += 1;
        
    }else{

        cart.push({
            name,
            price,
            quantity: 1,
        })
        

    }


    updateCartModal()



}

// atualiza carrinho
function updateCartModal(){
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.classList.add('flex','justify-between', 'mb-4', 'flex-col')
    
      cartItemElement.innerHTML = `
       <div class='flex items-center justify-between'>
      <div>
      <p class='font-bold'>${item.name}</p>
      <p>Quant:${item.quantity}</p>
      <p class='font-medium mt-2'> R$ ${item.price.toFixed(2)}</p>
      </div>  
      <button class='remove-from-cart-btn' data-name='${item.name}'>Remover</button>
      </div> `
      total += item.price * item.quantity;
    
      cartItemsContainer.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;

}

// Função para remover item no carrinho
cartItemsContainer.addEventListener("click", function (event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")
    removeItemCart(name);
}
        
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);

    if(index !== -1 ){
        const item = cart[index];
        if(item.quantity >1){
            item.quantity -= 1;
            updateCartModal();
            return;
        }
        cart.splice(index, 1);
        updateCartModal();
    }
}

addressInput.addEventListener("input", function(event){
    let inputValue = event.target.value;
    if(inputValue !==""){
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }

})
//Finalizar o pedido
checkoutBtn.addEventListener('click', function(){
    const isOpen = checkRestaurantOpen();
    if (!isOpen){
      Toastify({
        text: 'Ops! Adega está fechada! Horário de funcionamento: Sexta á Sábado das 16:00/02:00 e Domingo das 12:00/22:00',
        duration: 3000,
        close: true,
        gravity: 'top', // `top` or `bottom`
        position: 'right', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: '#ef4444',
        },
      }).showToast();
      return;
    }

// Enviar o pedido para o WhatsApp
const cartItems = cart.map((item, index) => {
    const subtotal = (item.quantity * item.price).toFixed(2); // Calcula o subtotal de cada item
    return (
      `*${index + 1}. ${item.name}*\n` +
      `Quantidade: ${item.quantity}\n` +
      `Preço unitário: R$ ${item.price.toFixed(2)}\n` +
      `Subtotal: R$ ${subtotal}\n`
    );
  }).join("\n");
  
  const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2); // Total do pedido
  
  // Verificar se o endereço foi preenchido
  const address = addressInput.value.trim();
  if (!address) {
    alert("Por favor, insira seu endereço para prosseguir com o pedido.");
    return; // Interrompe o envio se o endereço estiver vazio
  }
  
  // Adicionar a observação
  const observation = document.getElementById("observationInput").value || ""; // Pega o valor do campo de observação
  
  // Formatar a mensagem final para o WhatsApp
  const message = encodeURIComponent(
    `Pedido:\n\n${cartItems}\n*Total: R$ ${total}*\n\n` +
    `Endereço: ${address}\n` +
    (observation ? `\nObservação: ${observation}` : "")
  );
  
  const phone = "+5511948174784";
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  
  // Limpar o carrinho após o envio
  cart = [];
  updateCartModal();

})
    // Verificar a hora e manipular o card horário
    function checkRestaurantOpen() {
        const data = new Date();
        const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const hora = data.getHours();
    
        // Atualiza o horário de funcionamento no HTML
        updateOperatingHours(diaSemana);
    
        if (diaSemana === 5) { // Sexta (5)
            return (hora >= 16 && hora < 24) || (hora >= 0 && hora < 2);
        } else if (diaSemana === 6) { // Sábado (6)
            return (hora >= 16 && hora < 24) || (hora >= 0 && hora < 2);
        } else if (diaSemana === 0) { // Domingo
            return hora < 2 || (hora >= 12 && hora < 22);
        } else {
            return false; // Fechado nos outros dias
        }
    }


// Função para atualizar o horário de funcionamento no HTML
function updateOperatingHours(diaSemana) {
    const dateSpan = document.getElementById("date-span").querySelector("span");
    
    if (diaSemana === 5 || diaSemana === 6) {
        dateSpan.textContent = "Sexta e Sábado - 16:00 às 02:00";
    } else if (diaSemana === 0) {
        dateSpan.textContent = "Domingo - 12:00 às 22:00";
    } else {
        dateSpan.textContent = "Fechado";
    }
}

// Chama a função ao carregar a página para definir o horário atual
document.addEventListener("DOMContentLoaded", checkRestaurantOpen);

const spanItem = document.getElementById("date-span")
const isOpen = checkRestaurantOpen();

if(isOpen){
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600")
}else{
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-500")

}





  

