console.log('products')

import GetData from "./GetData.js";


var products;
var productsCopy;
var categoryList;
var cartAmount = 0;


// getting all the categories list
var getcategoryList = async ()=>{
    let categoriesDiv = document.querySelector('#product-categories');
    let allCategories = await GetData("http://localhost:5000/categories");

    // allowing only enabled status data
    let filteredCategories = allCategories.filter(category => category.enabled === true)

    // prefilling the data in array and modifying the array according to the 'order' index
    categoryList = Array(filteredCategories.length).fill(0);
    filteredCategories.forEach( category => {
        categoryList.splice(category.order-1, 1, category)
    });

    console.log(categoryList);

    // passing each category to generate category list
    categoryList.forEach( category => generateCategoryListItem(categoriesDiv, category))


}


// generating HTML element for the category
var generateCategoryListItem = (parent, {name, id})=> {
    // creating a div container for category
    let categoryElement = document.createElement('div');
    categoryElement.classList.add("category-item","pointer");
    categoryElement.setAttribute("role","button")
    categoryElement.setAttribute("id",id);
    // assigning text to the node
    let categoryTextNode = document.createTextNode(name);
    categoryElement.addEventListener("click", () =>{
        filterByID(id)
    })

    // assigning respective parents
    categoryElement.appendChild(categoryTextNode);
    parent.appendChild(categoryElement);

}


var filterByID = id => {
    console.log('Filtering by ID')
    console.log("ID",id);
    let productsRow = document.querySelector('.product-row');
    products = productsCopy.filter(product => {
        console.log(product.category);
        
        return product.category == id
    });
    productsRow.innerHTML = "";
    products.forEach(product => generateProductCard(productsRow, product));
}

// getting all the products list
var getProducts = async () => {
    let productsRow = document.querySelector('.product-row');
    products = await GetData("http://localhost:5000/products");
    console.log(products);
    productsCopy = products;
    products.forEach(product => generateProductCard(productsRow, product));
}


var generateProductCard = (parent, productDetails) => {
    // main card
    let card = document.createElement("div");
    card.classList.add("product-card", "lg-3", "md-6", "sm-12");

    // card title
    let cardTitle = document.createElement("h3");
    cardTitle.innerText = productDetails.name;
    cardTitle.classList.add("card-title");
    card.appendChild(cardTitle);

    // card image and description container
    let cardImgDesc = document.createElement("div");
    cardImgDesc.classList.add("card-img-desc");
    card.appendChild(cardImgDesc);

    // card image
    let cardImgContainer = document.createElement("div");
    cardImgContainer.classList.add("card-img-container");
    let cardImg = document.createElement("img");
    cardImg.classList.add("card-img");
    cardImg.src = productDetails.imageURL;
    cardImg.alt = productDetails.name;
    cardImgContainer.appendChild(cardImg)
    cardImgDesc.appendChild(cardImgContainer);
    // card.appendChild(cardImg);
        
    // card desciption
    let descriptionBox = document.createElement("div");
    descriptionBox.classList.add("card-desc","font-sm");

    let description = document.createTextNode(productDetails.description);
    descriptionBox.appendChild(description);
    cardImgDesc.appendChild(descriptionBox);
    // card.appendChild(descriptionBox);
    // card bottom
    let cardBottom = document.createElement("div");
    cardBottom.classList.add("card-bottom");

    // desktop res
    let productPrice = document.createElement("span");
    productPrice.classList.add("font-sm", "desktop");
    productPrice.innerText = `MRP Rs. ${productDetails.price}`;
    let buyNowBtn = document.createElement("button");
    buyNowBtn.classList.add("desktop");
    buyNowBtn.addEventListener("click", (event)=>{
        addToCart(event,productDetails);
    });
    buyNowBtn.id = productDetails.id;
    buyNowBtn.innerText = "Buy Now";

    // mobile res
    let buyNowWithPriceBtn = document.createElement('button');
    buyNowWithPriceBtn.classList.add("tablet");
    buyNowWithPriceBtn.innerText = `Buy Now @ ${productDetails.price}`;
    buyNowWithPriceBtn.addEventListener("click", event => addToCart(event, productDetails));
    

    cardBottom.appendChild(productPrice);
    cardBottom.appendChild(buyNowBtn);
    cardBottom.appendChild(buyNowWithPriceBtn);
    card.appendChild(cardBottom);

    parent.appendChild(card)

}

var addToCart = (event, productDetails)=> {
    event.target.innerText = "Added";
    event.target.classList.add("disabled");
    event.target.disabled = true;
    // console.log(productDetails);
    if(sessionStorage.getItem('cartItems')){
        let cartItems = JSON.parse(sessionStorage.getItem('cartItems'));
        console.log("CartItems ", cartItems);
        if(cartItems[productDetails.id]){
            console.log(cartItems[productDetails.id].quantity);
            cartItems[productDetails.id].quantity=cartItems[productDetails.id].quantity+1;
            console.log(cartItems[productDetails.id].quantity);
        }else{
            const uniqueItem = enterQuantity(productDetails)
            cartItems[productDetails.id] = uniqueItem;
            
        }

        sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
        countCartItems();
    }else{
        const mainObj = {};
        const uniqueItem = enterQuantity(productDetails);

        mainObj[productDetails.id] = uniqueItem;
        sessionStorage.setItem("cartItems", JSON.stringify(mainObj));
        countCartItems();
        
    }

}

var enterQuantity = (obj) => (
    {
    ...obj,
    quantity:1
    }
)

var countCartItems = () => {
    if(sessionStorage.getItem("cartItems")){
        let cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
        let uniqueItemCount = Object.keys(cartItems).length;
        document.querySelector('#cart-item-count').innerText = `${uniqueItemCount} items`;
        // document.querySelector('.box-item-count').innerText = `(${uniqueItemCount} items)`
    }
}

document.querySelector(".nav-right").addEventListener('click', ()=>{
    document.querySelector("#overlay").classList.add("active");
})


document.querySelector("#closeCartBtn").addEventListener('click',()=>{
    document.querySelector("#overlay").classList.remove("active");
})

var getCartItems = () =>{
    let cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
    console.log("Called");
    cartAmount=0;
    let uniqueItemCount = 0;
    if(cartItems){
        uniqueItemCount = Object.keys(cartItems).length;
    }
    
    for(let key in cartItems){
        cartAmount = cartAmount+(cartItems[key].price*cartItems[key].quantity);
        createCartElement(cartItems[key]);
    }

    document.querySelector(".checkout-price").innerText = `Rs. ${cartAmount} >`;
    document.querySelector('.box-item-count').innerText = `(${uniqueItemCount} items)`;
    

}


// function to decrease the cart item count ny 1
var minusCartQuantity = (event, itemDetails, itemCard)=>{
    let cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
    let cartItem = cartItems[itemDetails.id];
    if(cartItem.quantity == 1){
        delete cartItems[itemDetails.id];
        console.log("Running");
        console.log(cartItems[itemDetails.id]);
        itemCard.remove();
    }else{
        cartItem.quantity = cartItem.quantity-1;
        document.querySelector(".single-item-count").innerText = cartItem.quantity;
        document.querySelector(".amount").innerText = `Rs. ${cartItem.price* cartItem.quantity}`;
    }
    console.log("cartItems", cartItems)
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));

}

// function to increase the cart item count by 1
var addCartQuantity = (event, itemDetails, itemCount)=>{
    let cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
    let cartItem = cartItems[itemDetails.id];
    cartItem.quantity = cartItem.quantity+1;
    itemCount.innerText = cartItem.quantity;

    document.querySelector(".amount").innerText = `Rs. ${cartItem.price* cartItem.quantity}`;
    console.log("added", cartItems);
    sessionStorage.setItem("cartItems",JSON.stringify(cartItems));
    
}


var createCartElement = (itemDetails) => {
    let cartContainer = document.querySelector(".modal-cart-items");

    // item card
    let itemCard = document.createElement("div");
    itemCard.classList.add('cart-item');

    // item image
    let imgContainer = document.createElement("div");
    imgContainer.classList.add("item-img-container");
    let img = document.createElement("img");
    console.log(itemDetails);
    img.src = itemDetails.imageURL;
    img.alt = itemDetails.name;

    imgContainer.appendChild(img);
    itemCard.appendChild(imgContainer);

    // item details
    let itemDetailsContainer = document.createElement("div");
    itemDetailsContainer.classList.add("cart-item-details");
    itemCard.appendChild(itemDetailsContainer);
        // name
    let itemName = document.createElement("p");
    itemName.classList.add("item-name", "title");
    itemName.innerText = itemDetails.name;
    itemDetailsContainer.appendChild(itemName);
        // 

    let itemCalculation = document.createElement("div");
    itemCalculation.classList.add("item-calculation");
    itemDetailsContainer.appendChild(itemCalculation);

        // item count container
    let itemCountContainer = document.createElement("span");
    itemCountContainer.classList.add("item-count");
    itemCalculation.appendChild(itemCountContainer);
            // minus button
    let minusBtn = document.createElement("button");
    minusBtn.classList.add("minus-btn", "btn-circle");
    minusBtn.innerText = "-";
    minusBtn.addEventListener("click",(event) => minusCartQuantity(event, itemDetails, itemCard));
    itemCountContainer.appendChild(minusBtn);

            // item count
    let itemCount = document.createElement("span");
    itemCount.classList.add("single-item-count");
    itemCount.innerText = itemDetails.quantity;
    itemCountContainer.appendChild(itemCount);

            // add button
    let addBtn = document.createElement("button");
    addBtn.classList.add("add-btn", "btn-circle");
    addBtn.innerText = "+";
    itemCountContainer.appendChild(addBtn);
    addBtn.addEventListener("click", (event)=> addCartQuantity(event,itemDetails, itemCount));
    
            // item unit price
    let unitPrice = document.createElement("span");
    unitPrice.classList.add("item-unit-price");
    unitPrice.innerText = `X ${itemDetails.price}`;
    itemCountContainer.appendChild(unitPrice);

    // calculatedPrice
    let calculatedPriceContainer = document.createElement("div");
    calculatedPriceContainer.classList.add("calculated-price");
    let amount = document.createElement("span");
    amount.classList.add("amount");
    console.log("calc",itemDetails.price*itemDetails.quantity );
    amount.innerText = `Rs. ${itemDetails.price*itemDetails.quantity}`;
    calculatedPriceContainer.appendChild(amount);
    itemCalculation.appendChild(calculatedPriceContainer);


    cartContainer.appendChild(itemCard);
}


document.querySelector(".nav-right").addEventListener("click",()=>{
    document.querySelector(".modal-cart-items").innerHTML="";
    console.log("GEtting cart items");
    getCartItems();
} )

getcategoryList();
getProducts();
countCartItems();
getCartItems();