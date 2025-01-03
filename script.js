var Products = [
  {
    name: "Blue Chair",
    headline: "This is Blue",
    price: "10,000",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJsdWUlMjBjaGFpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Black Chair",
    headline: "This is Black",
    price: "16,000",
    image:
      "https://images.unsplash.com/photo-1574189555774-7cbcd66d0fcb?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjBjaGFpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "white Chair",
    headline: "This is White",
    price: "10,000",
    image:
      "https://plus.unsplash.com/premium_photo-1678074057896-eee996d4a23e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8d2hpdGUlMjBjaGFpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Black Chair",
    headline: "This is Red",
    price: "15,600",
    image:
      "https://images.unsplash.com/photo-1585298014716-62d4843bedd7?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHJlZCUyMGNoYWlyfGVufDB8fDB8fHww",
  },
  {
    name: "Chair",
    headline: "This is baloon",
    price: "10,000",
    image:
      "https://images.unsplash.com/photo-1429087969512-1e85aab2683d?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2hhaXJ8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "New Chair",
    headline: "This is New",
    price: "16,000",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hhaXJ8ZW58MHx8MHx8fDA%3D",
  },
];
var Popular = [
  {
    name: "Blue Chair",
    headline: "This is Blue",
    price: "10,000",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJsdWUlMjBjaGFpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Black Chair",
    headline: "This is Black",
    price: "10,000",
    image:
      "https://images.unsplash.com/photo-1574189555774-7cbcd66d0fcb?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjBjaGFpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "white Chair",
    headline: "This is White",
    price: "10,000",
    image:
      "https://plus.unsplash.com/premium_photo-1678074057896-eee996d4a23e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8d2hpdGUlMjBjaGFpcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "red Chair",
    headline: "This is Red",
    price: "10,000",
    image:
      "https://images.unsplash.com/photo-1585298014716-62d4843bedd7?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHJlZCUyMGNoYWlyfGVufDB8fDB8fHww",
  },
];
function showProducts() {
  var clutter = "";
  Products.forEach(function (product, index) {
    clutter += `
        <div class="product w-fit rounded-xl p-2 bg-white">
            <div class="image w-[14rem] h-[13rem] bg-zinc-200 rounded-xl overflow-hidden">
                <img src="${product.image}" class="w-full h-full object-cover">
            </div>
            <div class="data w-full px-2 py-5">
                <h1 class="font-semibold text-xl leading-none tracking-tight">${product.name}</h1>
                <div class="flex justify-between w-full items-center mt-2">
                    <div class="w-1/2">
                        <h3 class="font-semibold opacity-20">${product.headline}</h3>
                        <h4 class="font-semibold mt-2">&#8377; ${product.price}</h4>
                    </div>
                    <button data-index=${index} class="add w-10 h-10 rounded-full shader text-yellow-400"><i
                        data-index=${index}    class="add ri-add-line"></i></button>
                </div>
            </div>
        </div>`;
  });
  document.querySelector(".products").innerHTML = clutter;
}
function showPopularProducts() {
  var clutter = "";
  Popular.forEach(function (product) {
    clutter += `<div class="popular bg-white p-2 rounded-2xl flex items-start gap-3 w-[20%] flex-shrink-0">
        <div class="w-20 h-20 bg-red-500 flex-shrink-0 rounded-2xl border-4 border-white overflow-hidden">
            <img class="w-full h-full object-cover"
                src="${product.image}"
                alt="">
        </div>
        <div class="data py-2 w-full">
            <h1 class="leading-none font-semibold">${product.name}</h1>
            <h4 class="leading-none mt-2 text-sm font-semibold opacity-20">${product.headline}</h4>
            <h4 class="mt-3 font-semibold text-zinc-500">&#8377;${product.price}</h4>
        </div>
    </div>
  `;
  });
  document.querySelector(".populars").innerHTML = clutter;
}
var cart = [];
function addToCart() {
  document
    .querySelector(".products")
    .addEventListener("click", function (details) {
      if (details.target.classList.contains("add")) {
        cart.push(Products[details.target.dataset.index]);
        showCart();
      }
    });
  document
    .querySelector(".carticon")
    .addEventListener("click", function (details) {
      if (details.target.classList.contains("sub")) {
        let ind = details.target.dataset.index;
        if (ind !== -1) {
          cart.splice(ind, 1);
        }
        showCart();
      }
    });
}
function showCart() {
  var clutter = "";
  cart.forEach(function (prod, index) {
    clutter += `<div class="flex gap-2 bg-white p-2 rounded-lg ">
        <div class="w-10 h-10 flex-shrink-0 rounded-lg 0 overflow-hidden">
        <img  class="w-full h-full object-cover" src="${prod.image}"/>
        </div>
        <div>
            <h3 class="">${prod.name}</h3>
            <h5 class="text-sm font-semibold opacity-80">${prod.price}</h5>
            <button class="sub w-10 h-10 rounded-full shader text-yellow-400"><i class="sub ri-subtract-line"  data-index=${index}> </i></button>
        </div>
     </div>`;
  });
  document.querySelector(".carticon").innerHTML = clutter;
}
function search() {
  var input = document.querySelector(".Input");
  var Search = document.querySelector(".Search");
  Search.addEventListener("click", function () {
    var clutter = "";
    Products.forEach(function (product, index) {
      if (input.value.toLowerCase() == product.name.toLowerCase()) {
        clutter += ` <div class="product w-full h-20 flex  items-center  p-2 bg-white">
            <div class="image w-10 h-10 bg-black rounded-xl overflow-hidden">
                <img src="${product.image}"
                    class="w-10 h-10 object-cover">
            </div>
            <div class="data flex items-center  px-2 py-5 gap-5">
                <h1 class="font-semibold text-xl leading-none tracking-tight">${product.name}</h1>
                <div class="flex justify-between gap-20 w-full items-center mt-2">
                    <div class="w-1/2 flex items-center  justify-center">
                        <h3 class="font-semibold opacity-20">${product.headline}</h3>
                        <h4 class="font-semibold mt-2">&#8377;${product.price}</h4>
                    </div>
                    <button data-index=${index} class="add w-10 h-10 rounded-full shader text-yellow-400"><i
                            data-index=${index} class="add ri-add-line"></i></button>
                </div>
            </div>
        </div>`;
      }
    
    });
    document.querySelector(".search").innerHTML = clutter;
  });
}
search();
showCart();
addToCart();
showProducts();
showPopularProducts();
