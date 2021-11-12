console.log("Hi");
import GetData from './GetData.js';

// async function GetData(url){
//     try {
//         let response = await fetch(url);
//         // console.log(response);
//         if(response.ok){
//         let data = await response.json();
//             console.log(data);
//         }else{
//             throw new Error("Something went wrong");
//         }
//     } catch (error) {
//         console.log(error);;
//     }
// }
var banners;
var categories;
var bannerImages;
let dots = document.querySelectorAll(".dot");

let backBtn = document.querySelector(".button-prev");
let nextBtn = document.querySelector(".button-next");
let currentIndex = 0;

console.log(bannerImages);

// var addActiveClass = index => {
//     console.log("Trigg", index);

    
// }



var getBanners = async ()=> {
    let unsortedBanners = await GetData("http://localhost:5000/banners");
    // generating dummy array of same length as unsorted banners
    banners = Array(unsortedBanners.length).fill(0);
    // replacing the banners in sorted order in banners array
    unsortedBanners.forEach((banner, index)=> banners.splice(index,1,banner))

    let bannersDiv = document.querySelector('#banners');
    let singleBanner = document.createElement("div");
    singleBanner.classList.add("single-banner-static");
    let img = document.createElement('img');
    img.classList.add("banner-img-static", "img-res");
    console.log(banners[0].bannerImageUrl);
    img.alt = banners[0].bannerImageAlt;
    img.src = banners[0].bannerImageUrl;
    singleBanner.appendChild(img);
    bannersDiv.appendChild(singleBanner);


    banners.map((banner, index) => {
        let singleBanner = document.createElement("div");
        singleBanner.classList.add("single-banner");
        let img = document.createElement('img');
        img.classList.add("banner-img", "img-res");
        img.alt = banner.bannerImageAlt;
        img.src = banner.bannerImageUrl;
        singleBanner.appendChild(img);
        bannersDiv.appendChild(singleBanner);
        bannerImages = document.querySelectorAll(".single-banner");
        if(index == 0){
            bannerImages[currentIndex].classList.add("active");
            dots[currentIndex].classList.add("active")
        }
    })

    dots.forEach((dot, index)=>{
        dot.addEventListener("click", ()=>{
            for(let i = 0; i < dots.length; i++){
                dots[i].classList.remove("active");
                // bannerImages[i].classList.remove("active");
                bannerImages[i].classList.remove("active");
            }
        
            dots[index].classList.add("active");
            bannerImages[index].classList.add("active");
            currentIndex = index;
        })
    })
}


backBtn.addEventListener("click",()=>{
    bannerImages[currentIndex].classList.remove("active");
    dots[currentIndex].classList.remove("active");
    currentIndex = currentIndex-1<0 ? bannerImages.length-1: currentIndex-1;
    bannerImages[currentIndex].classList.add("active");
    dots[currentIndex].classList.add("active");

})

nextBtn.addEventListener("click",()=>{
    bannerImages[currentIndex].classList.remove("active");
    dots[currentIndex].classList.remove("active");
    currentIndex = currentIndex+1> bannerImages.length-1 ? 0: currentIndex+1;
    bannerImages[currentIndex].classList.add("active");
    dots[currentIndex].classList.add("active");
})

// getting categories 
var getCategories = async ()=>{
    let categoriesDiv = document.querySelector('#categories');
    let allCategories = await GetData("http://localhost:5000/categories");

    // allowing only enabled status data
    let filteredCategories = allCategories.filter(category => category.enabled === true)

    // prefilling the data in array and modifying the array according to the 'order' index
    categories = Array(filteredCategories.length).fill(0);
    filteredCategories.forEach( category => {
            categories.splice(category.order-1, 1, category)
        });;

    // looping and generating HTML card elements
    categories.forEach((category,index) => {
        generateCategoryCard(categoriesDiv,index,category)
    })

    console.log(categories);

}

// function to generate Card Element with positions of elements based on index
function generateCategoryCard(parent, index, categoryDetails){
    // card div
    let categoryCard = document.createElement('div');
    categoryCard.classList.add("categories-card");
    // container of details
    let cardDetails = document.createElement('div');
    cardDetails.classList.add("card-details")
    // card heading
    let cardTitle = document.createElement('h2');
    cardTitle.innerHTML = categoryDetails.name;
    // card description
    let cardDescription = document.createElement('p');
    cardDescription.innerHTML = categoryDetails.description;
    // card button
    let cardButton = document.createElement('button');
    cardButton.innerText = `Explore ${categoryDetails.key}`;
    cardButton.addEventListener("click",()=>{
        console.log("clicked");
        window.location.href ="./products.html"
    })

    cardDetails.appendChild(cardTitle);
    cardDetails.appendChild(cardDescription);
    cardDetails.appendChild(cardButton);

    // card image
    let imageSection = document.createElement('div');
    let cardImg = document.createElement('img')
    cardImg.src = categoryDetails.imageUrl;
    cardImg.alt = categoryDetails.name;
    imageSection.classList.add("img-section");
    cardImg.classList.add('card-img')
    imageSection.appendChild(cardImg);

    // assigning left or right position
    if(index%2 == 0){
        categoryCard.appendChild(imageSection);
        categoryCard.appendChild(cardDetails);
    }else{
        categoryCard.appendChild(cardDetails);
        categoryCard.appendChild(imageSection);
    }

    parent.appendChild(categoryCard);

}









getBanners();
getCategories();


