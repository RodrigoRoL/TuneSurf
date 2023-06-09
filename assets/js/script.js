let artist = JSON.parse(localStorage.getItem("userInput"));
let nameEl = document.querySelector("#artist");
let followersEl = document.querySelector("#followers");
let genreEl = document.querySelector("#genre");

//Return to menu button
let menuButton = document.querySelector("#menu");
menuButton.addEventListener("click", function (event) {
    location.href = "index.html"
});

// Spotify Auth
const clientId = '083ca6c5e35e4936a1e52a1611cf4516';
const clientSecret = 'e97063521a0348f085cf54408a747090';
const base64ClientIdSecret = btoa(`${clientId}:${clientSecret}`);
const tokenUrl = 'https://accounts.spotify.com/api/token';

function getToken() {
  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${base64ClientIdSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    .then(data => {
      return data.access_token;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function artistSearch(accessToken) {
  const apiUrl = `https://api.spotify.com/v1/search?q=${artist}&type=artist`;

  return fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    .then(data => {
      console.log("data artist", data)
      const name = data.artists.items[0].name;
      const followers = data.artists.items[0].followers.total;
      const genres = data.artists.items[0].genres[0];
      const id = data.artists.items[0].id;

      nameEl.textContent = name;
      followersEl.textContent = followers + " followers";
      genreEl.textContent = genres;

      localStorage.setItem("id", JSON.stringify(id));
      return id; // we need to return the id for further calls
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function artistAlbums(artistId, accessToken) {
  const albumURL = `https://api.spotify.com/v1/artists/${artistId}/albums`;

  fetch(albumURL, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    .then(data => {
      for (var i = 0; i <= 3; i++) {
        const albumName = data.items[i].name;
        const date = data.items[i].release_date;
        const year = dayjs(date).format("YYYY");
        const image = data.items[i].images[2].url;
        const spotify = data.items[i].external_urls.spotify;

        let newEl = document.createElement("article");
        newEl.innerHTML += `<figure class="media-left"><p class="image is-64x64"><img src=${image}></p></figure><div class="media-content"><div class="content"><p><strong class="has-text-white">${albumName}</strong><small class="has-text-white"> ${year}</small><br><a href=${spotify} >Listen now on Spotify</a></p></div></div>`;
        newEl.className = "media";
        document.getElementById("top-albums").append(newEl);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function relatedArtists(artistId, accessToken) {
  const relatedURL = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;

  fetch(relatedURL, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    .then(data => {
      for (var i = 0; i <= 2; i++) {
        const relatedArtist = data.artists[i].name;
        const relatedFollowers = data.artists[i].followers.total;
        const relatedSpotify = data.artists[i].external_urls.spotify;
        const relatedImage = data.artists[i].images[2].url;

        let newEl = document.createElement("article");
        newEl.innerHTML += `<figure class="media-left"><p class="image is-64x64"><img class="is-rounded" src=${relatedImage}></p></figure><div class="media-content"><div class="content"><p><strong class="has-text-white">${relatedArtist}</strong><small class="has-text-white"> ${relatedFollowers} Followers </small><br><a href=${relatedSpotify}>Explore</a></p></div></div>`;
        newEl.className = "media";
        document.getElementById("related-artists").append(newEl);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

getToken().then(function (token) {
  // First, perform the artist search
  // the use of return statements in the .then() functions is essential for chaining Promises and passing data between them
  return artistSearch(token).then(function (artistId) {
    return { artistId, token };
    // By returning { artistId, token }, we can chain another .then() function after this one, 
    // which will receive this object as an argument. This allows us to pass both the artistId 
    // and the token to the subsequent steps in the Promise chain, ensuring we have the necessary 
    // information to call the artistAlbums() and relatedArtists() functions.
  });
}).then(function ({ artistId, token }) {
  // Check if we have a valid artistId before proceeding
  if (artistId) {
    // Retrieve the artistId from localStorage here instead of getting it in each function
    let storedArtistId = JSON.parse(localStorage.getItem("id"));

    // Pass both storedArtistId and token to the artistAlbums and relatedArtists functions
    artistAlbums(storedArtistId, token);
    relatedArtists(storedArtistId, token);
  } else {
    console.error('Error: Unable to fetch artist information');
  }
}).catch(function (error) {
  console.error('Error:', error);
});


//Tumblr
const apiKey = '5fK7ZriTD9B3gmtu7wd0JF2PQy7iY6WQZhw74u3Q9Slb8Dtjln';
const limit = 20;
const tumblrUrl = `https://api.tumblr.com/v2/tagged?api_key=${apiKey}&tag=${artist}&limit=${limit}&filter=photo`;

function getMedia(){
    fetch(tumblrUrl)
      .then(response => response.json())
      .then(data => {
        // Do something with the retrieved data
        console.log(data);
        const posts = data.response;
        const media = posts.filter(post => post.type === 'photo' || post.type === 'video' || post.type === 'gif');
        const imageMedia = [];
           // Select only 5 items from the data
          while  (imageMedia.length < 5 && media.length > 0){
            const index = Math.floor(Math.random() * media.length);
            imageMedia.push(media[index]);   // Add elements to the array 
            media.splice(index,1);
          }
        const textMedia = posts.filter(post => post.type === 'text' || post.type === 'quote');
        const texts = [];
          while (texts.length < 2 && textMedia.length > 0){ 
            const indexText = Math.floor(Math.random() * textMedia.length);
            texts.push(textMedia[indexText]);
            textMedia.splice(indexText,1);
          }
          console.log(imageMedia);
          console.log(texts);
          const container = document.querySelector('#media-1');
          const textContainer = document.querySelector('#media-text');
          for (let i = 0; i < imageMedia.length; i++) {
            if (imageMedia[i].type === 'video') {
                container.innerHTML += `<img src="${imageMedia[i].thumbnail_url}" alt="random media" class="media-item-${i+1}" >`;
              } else {    
                container.innerHTML += `<img src="${imageMedia[i].photos[0].original_size.url}" alt="random media" class="media-item-${i+1}" >`;
              }
             }
          for (let i = 0; i < texts.length; i++) {
            textContainer.innerHTML += `<p> ${texts[i].summary} </p>`;
          }})
         };
  
     

//Ticketmaster
const ticketid = "io5nerXdiuuhzQi2TB1bN1Dh0N9Vtllx";

const event1El = document.getElementById("event1");
const event2El = document.getElementById("event2");
const event3El = document.getElementById("event3");

  //Shows by Ticketmaster
function Show() {
  const showlocation = `https://app.ticketmaster.com/discovery/v2/events?apikey=${ticketid}&keyword=${artist}&locale=*&countryCode=MX`
  fetch(showlocation, {
    method: 'GET',
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Request failed');
      }
    })
    
    .then(data => {
        console.log(data);
        console.log("event1", event1El);
        event1El.textContent = data._embedded.events[0].name;
        console.log("embedded", data._embedded.events[0].name);
        event2El.textContent = data._embedded.events[1].name;
        event3El.textContent = data._embedded.events[2].name;
        console.log("data", data)
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
 

Show();
getMedia();