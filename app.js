import { detectType, setStorage, detectIcon } from "./helpers.js";

//html den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");
// olay izleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

//! ortak kullanim alani
var map;
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];
var layerGroup = [];

//!kullanicinin konumunu ogrenme
navigator.geolocation.getCurrentPosition(loadMap);
//haritaya tiklaninca calisan fonksiyon
function onMapClick(e) {
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];
  // L.marker(e.latlng).addTo(map).bindPopup("deneme yazisi").openPopup();
}

//!kullanicinin konumuna gore ekrani haritaya basma
function loadMap(position) {
  //haritanin kurulumu yapar
  map = L.map("map").setView(
    [position.coords.latitude, position.coords.longitude],
    14
  );

  //Haritanin nasil gozukecegini belirler
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // haraitada map uzerindeki layer lari gosterme
  layerGroup = L.layerGroup().addTo(map);

  //localden notelari listeleme
  renderNoteList(notes);

  //haritada bir tıklama oldugund calisacak fonsiyon
  map.on("click", onMapClick);
}

// ekran imlec basar
function renderMarker(item) {
  //markeri olusturur
  L.marker(item.coords, { icon: detectIcon(item.status) })
    .addTo(layerGroup)
    //userine tiklaninca acilacak popup ekleme
    .bindPopup(`${item.desc}`);
}

//formun gonderilme olayında calisir
function handleSubmit(e) {
  e.preventDefault();
  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  //notlar dizisine el. ekleme
  notes.push({
    id: new Date().getTime(),
    desc,
    date,
    status,
    coords,
  });

  //local storage guncelleme
  setStorage(notes);

  //notlari listeleme
  renderNoteList(notes);

  //formu kapatma
  form.style.display = "none";
}

//ekrana notlari basma fonk.

function renderNoteList(items) {
  // note lar alanni temizle
  list.innerHTML = "";

  // imlecleri temizler
  layerGroup.clearLayers();

  // her bir not icin fonk. calistirir
  items.forEach((item) => {
    // li else. olusturur
    const listEle = document.createElement("li");
    //data sina sahip oldugu id yi ekleme
    listEle.dataset.id = item.id;

    //icerigi belirleme
    listEle.innerHTML = `
    <div>
    <p>${item.desc}</p>
    <p><span> tarih</span>${item.date}</p>
    <p><span>Durum</span> ${detectType(item.status)}</p>
  </div>
  <i id="fly" class="bi bi-airplane-engines-fill"></i>
  <i id="delete" class="bi bi-trash"></i>
  `;

    //html deki listeye elemani ekler
    list.insertAdjacentElement("afterbegin", listEle);

    //ekrana bas
    renderMarker(item);
  });
}

//notlar alaninda tiklanma olayini izler

function handleClick(e) {
  // guncellenecek else. id ogrenme
  const id = e.target.parentElement.dataset.id;
  if (e.target.id === "delete") {
    //id sini bildigimiz el. diziden kaldirma
    notes = notes.filter((note) => note.id != id);
    console.log(notes);
    //locali guncelle
    setStorage(notes);

    //ekrani guncelle
    renderNoteList(notes);
  }
  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == id);

    map.flyTo(note.coords);
  }
}
