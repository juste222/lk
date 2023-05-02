let cursor = undefined;
let settings = undefined;
import { BskyAgent, AtpSessionEvent, AtpSessionData } from '@atproto/api'
const agent = new BskyAgent({
    service: 'https://bsky.social',
    persistSession: (evt, sess) => {
        if (evt === "create") {
            localStorage.session = JSON.stringify(sess)
        }
    }
})

document.querySelector('#signin').addEventListener("click", () => {login()})
document.querySelector('#loginpage').addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        login() 
    }
})

if (localStorage.session && localStorage.session !== 'undefined') {
    agent.resumeSession(JSON.parse(localStorage.session)).then((out) => {
        console.log(out)
        document.querySelector('#logincontainer').remove();
        displayImages();
        document.querySelector('.moar').style.display = 'flex';
    }).catch((err) => {
        //alert(err)
    })
} else {
    document.querySelector('#logincontainer').style.display = 'flex';
}

function login() {
    agent.login({
        identifier: document.querySelector('#login').value,
        password: document.querySelector('#pass').value
    }).then((out) => {
        console.log(out)
        document.querySelector('#logincontainer').remove();
        document.querySelector('.moar').style.display = 'flex';
        displayImages();
    }).catch((err) => {
        alert(err)
    })
}

function displayImages() {
    if (cursor !== undefined) {
        settings = {includeNsfw: true, limit: 100, cursor: cursor}
    } else {
        settings = {includeNsfw: true, limit: 100}
    }
    agent.app.bsky.unspecced.getPopular(settings).then(response => {response.data.feed.forEach(thing => {
        cursor = response.data.cursor
        if (thing.post.embed) {
            if (thing.post.embed.$type === "app.bsky.embed.images#view") {
                thing.post.embed.images.forEach((image) => {
                    let img = document.createElement('img');
                    img.src = image.thumb;
                    img.loading = 'lazy';
                    if (thing.post.labels.some(label => label.val === 'nudity' || label.val === 'sexual')) {
                        img.classList.add("explicit")
                    }
                    let a = document.createElement('a');
                    a.href = `https://staging.bsky.app/profile/${thing.post.author.did}/post/${thing.post.uri.split("/").pop()}`
                    a.appendChild(img)
                    a.id = 'link'
                    document.querySelector('#images').insertBefore(a, document.querySelector('.moar'));
                })

            } 
        }
    })});
}

document.querySelector('.moar').addEventListener("click", () => {displayImages()})
