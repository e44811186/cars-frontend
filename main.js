const API_BASE = "https://cars-api-ur5t.onrender.com/api/cars";
let allCars = [];
const brandsList = document.getElementById("brands-list");
const carsList = document.getElementById("cars-list");

function buildPrices(base){
  return [Math.round(base), Math.round(base*0.95), Math.round(base*0.9)];
}
function createCarArticle(car){
  const prices = buildPrices(car.price);
  const article = document.createElement("article");
  article.className = "car";
  article.innerHTML=`
    <img src="${car.imageUrl}" alt="${car.brand} ${car.model}" loading="lazy">
    <div class="car-details">
      <h4>${car.brand} ${car.model} (${car.year})</h4>
      <p>${car.description}</p>
      <div class="car-action">
        <ul>
          ${["на 1 сутки","на 1-3 суток","на 3+ суток"].map((p,i)=>`
          <li>
            <div class="car-period">${p}</div>
            <div class="car-price">${prices[i]} $ ${i>0?'<span>/сут</span>':''}</div>
          </li>`).join("")}
        </ul>
        <a href="#order" class="button white-button" data-title="${car.brand} ${car.model}">Забронировать</a>
      </div>
    </div>`;
  article.querySelector("a.white-button").addEventListener("click",()=>{
    document.getElementById("car").value = car.brand+" "+car.model;
  });
  return article;
}
function renderCars(cars){
  carsList.innerHTML=""; cars.forEach(c=>carsList.appendChild(createCarArticle(c)));
}
function renderBrands(){
  brandsList.innerHTML="";
  const uniq=["Все марки",...new Set(allCars.map(c=>c.brand))];
  uniq.forEach((brand,idx)=>{
    const li=document.createElement("li");
    li.textContent=brand;
    if(idx===0) li.classList.add("active");
    li.addEventListener("click",()=>{
      [...brandsList.children].forEach(el=>el.classList.remove("active"));
      li.classList.add("active");
      renderCars(brand==="Все марки"?allCars:allCars.filter(c=>c.brand===brand));
      document.getElementById("cars-content").scrollIntoView({behavior:"instant"});
    });
    brandsList.appendChild(li);
  });
}
async function loadCars(){
  try{
    const res=await fetch(API_BASE);
    allCars=await res.json();
    renderBrands(); renderCars(allCars);
  }catch(e){console.error(e);}
}
loadCars();

/* форма */
document.getElementById("orderForm").addEventListener("submit",e=>{
  e.preventDefault();
  const car=document.getElementById("car").value.trim();
  const name=document.getElementById("name").value.trim();
  const phone=document.getElementById("phone").value.trim();
  if(!car||!name||!phone) return;
  alert(`Заявка отправлена!\nАвто: ${car}\nИмя: ${name}\nТелефон: ${phone}`);
  e.target.reset();
});

/* маска телефона */
const phoneInput=document.getElementById("phone");
phoneInput.addEventListener("input",function(){
  let v=this.value.replace(/\D/g,""); if(!v) return this.value="";
  v=v.substring(0,11);
  let f="+";
  if(v[0]==="7"||v[0]==="8"){f+="7 "; v=v.substring(1);} else {f+=v[0]; v=v.substring(1);}
  if(v.length>0) f+="("+v.substring(0,3);
  if(v.length>=4) f+=") "+v.substring(3,6);
  if(v.length>=7) f+="-"+v.substring(6,8);
  if(v.length>=9) f+="-"+v.substring(8,10);
  this.value=f;
});

/* бургер */
const burger=document.getElementById("burger");
const menu=document.getElementById("menu");
burger.addEventListener("click",()=>menu.classList.toggle("show"));
menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("show")));
