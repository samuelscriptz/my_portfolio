/* TYPING EFFECT */
const typing = document.querySelector(".typing");

if (typing) {
    const roles = [
        "Data Science Enthusiast",
        "Machine Learning Developer",
        "Web Developer",
        "Creative Technologist"
    ];

    let i = 0, j = 0, del = false;

    function type() {
        typing.textContent = roles[i].substring(0, j);

        if (!del) {
            j++;
            if (j === roles[i].length + 1) del = true;
        } else {
            j--;
            if (j === 0) {
                del = false;
                i = (i + 1) % roles.length;
            }
        }
        setTimeout(type, del ? 60 : 100);
    }
    type();
}

/* SCROLL REVEAL & ACTIVE NAV */
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav ul li a");
const reveals = document.querySelectorAll(".reveal");

function handleScroll() {
    let current = "";

    // Scroll Reveal logic
    reveals.forEach(el => {
        const revealTop = el.getBoundingClientRect().top;
        if (revealTop < window.innerHeight - 150) {
            el.classList.add("active");
        }
    });

    // Active Nav logic
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("load", handleScroll);

/* STARS GENERATION */
const starsContainer = document.getElementById("stars-container");

function createStars() {
    if (!starsContainer) return;
    const count = 100; // Optimized count
    for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.className = "star";
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
        star.style.animationDelay = `${Math.random() * 5}s`;
        starsContainer.appendChild(star);
    }
}

createStars();
window.addEventListener("scroll", handleScroll);

/* CUSTOM CURSOR */
let cursor = document.querySelector(".cursor-outline");
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Faster lerp for cursor
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;

    if (!cursor) cursor = document.querySelector(".cursor-outline");

    if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateCursor);
}

// Only start animation if not a touch device (simple check)
if (window.matchMedia("(pointer: fine)").matches) {
    animateCursor();
}

// Interactive hover effects
const links = document.querySelectorAll("a, button, select, .close-modal");
links.forEach(link => {
    link.addEventListener("mouseenter", () => {
        if (cursor) {
            cursor.style.width = "40px";
            cursor.style.height = "40px";
            cursor.style.background = "rgba(0, 255, 255, 0.4)";
        }
    });
    link.addEventListener("mouseleave", () => {
        if (cursor) {
            cursor.style.width = "20px";
            cursor.style.height = "20px";
            cursor.style.background = "rgba(0, 255, 255, 0.6)";
        }
    });
});

/* MUSIC ENGINE */
const musicForm = document.getElementById("music-form");
const musicModal = document.getElementById("music-modal");
const modalBody = document.getElementById("modal-recommendation");
const closeModal = document.querySelector(".close-modal");

/* CONTACT FORM */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');

        const formData = {
            name: document.getElementById("contact-name").value,
            email: document.getElementById("contact-email").value,
            message: document.getElementById("contact-message").value,
            date: new Date().toISOString()
        };

        try {
            submitBtn.disabled = true;
            btnText.textContent = "Sending...";

            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                // If it's not JSON, it's likely an HTML error page (404/500)
                throw new Error("Server Error: " + text.substring(0, 100));
            }

            if (response.ok) {
                alert("Message sent successfully!");
                contactForm.reset();
            } else {
                throw new Error(data.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = "Send Message";
        }
    });
}

class MusicEngine {
    constructor() {
        this.apiKey = "xxx";
        this.model = "gemini-pro";
    }

    async getRecommendations(prefs) {
        if (!this.apiKey || this.apiKey.length < 20) {
            return this.getMockResults(prefs);
        }

        try {
            const prompt = `Suggest ONE (1) real, popular song. 
            Genre: ${prefs.genre}, Era: ${prefs.era === 'old' ? 'Before 2010' : '2018 onwards'}, Tempo: ${prefs.tempo}.
            Return ONLY a JSON object: {"title": "..", "artist": "..", "year": 2020}.
            Ensure it matches the genre ${prefs.genre} strictly. No talk, just JSON.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error("API Limit");

            let text = data.candidates[0].content.parts[0].text;
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const song = JSON.parse(text);

            return {
                ...song,
                url: `https://open.spotify.com/search/${encodeURIComponent(song.title + " " + song.artist)}`,
                tempoVal: prefs.tempo === 'slow' ? 70 : (prefs.tempo === 'medium' ? 100 : 130)
            };
        } catch (error) {
            return this.getMockResults(prefs);
        }
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getMockResults(prefs) {
        const songs = [
            // POP
            { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", genre: "Pop", era: "new", tempo: "slow", year: 2024 },
            { title: "Birds of a Feather", artist: "Billie Eilish", genre: "Pop", era: "new", tempo: "medium", year: 2024 },
            { title: "Espresso", artist: "Sabrina Carpenter", genre: "Pop", era: "new", tempo: "fast", year: 2024 },
            { title: "Good Luck, Babe!", artist: "Chappell Roan", genre: "Pop", era: "new", tempo: "medium", year: 2024 },
            { title: "Blinding Lights", artist: "The Weeknd", genre: "Pop", era: "new", tempo: "fast", year: 2020 },
            { title: "Cruel Summer", artist: "Taylor Swift", genre: "Pop", era: "new", tempo: "fast", year: 2019 },
            { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", genre: "Pop", era: "old", tempo: "fast", year: 2014 },
            { title: "Shake It Off", artist: "Taylor Swift", genre: "Pop", era: "old", tempo: "fast", year: 2014 },
            { title: "Thriller", artist: "Michael Jackson", genre: "Pop", era: "old", tempo: "medium", year: 1982 },
            { title: "Toxic", artist: "Britney Spears", genre: "Pop", era: "old", tempo: "fast", year: 2003 },
            { title: "Rolling in the Deep", artist: "Adele", genre: "Pop", era: "old", tempo: "medium", year: 2011 },
            { title: "Shape of You", artist: "Ed Sheeran", genre: "Pop", era: "old", tempo: "medium", year: 2017 },
            { title: "Bad Guy", artist: "Billie Eilish", genre: "Pop", era: "new", tempo: "fast", year: 2019 },
            { title: "Like a Prayer", artist: "Madonna", genre: "Pop", era: "old", tempo: "medium", year: 1989 },
            { title: "As It Was", artist: "Harry Styles", genre: "Pop", era: "new", tempo: "fast", year: 2022 },
            { title: "Flowers", artist: "Miley Cyrus", genre: "Pop", era: "new", tempo: "medium", year: 2023 },
            { title: "Levitating", artist: "Dua Lipa", genre: "Pop", era: "new", tempo: "medium", year: 2020 },
            { title: "Billie Jean", artist: "Michael Jackson", genre: "Pop", era: "old", tempo: "medium", year: 1982 },
            { title: "Sorry", artist: "Justin Bieber", genre: "Pop", era: "old", tempo: "medium", year: 2015 },
            { title: "Watermelon Sugar", artist: "Harry Styles", genre: "Pop", era: "new", tempo: "medium", year: 2019 },

            // ROCK
            { title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", era: "old", tempo: "slow", year: 1975 },
            { title: "Stairway to Heaven", artist: "Led Zeppelin", genre: "Rock", era: "old", tempo: "slow", year: 1971 },
            { title: "Hotel California", artist: "Eagles", genre: "Rock", era: "old", tempo: "medium", year: 1976 },
            { title: "Smells Like Teen Spirit", artist: "Nirvana", genre: "Rock", era: "old", tempo: "fast", year: 1991 },
            { title: "Comfortably Numb", artist: "Pink Floyd", genre: "Rock", era: "old", tempo: "slow", year: 1979 },
            { title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Rock", era: "old", tempo: "fast", year: 1987 },
            { title: "Back in Black", artist: "AC/DC", genre: "Rock", era: "old", tempo: "fast", year: 1980 },
            { title: "Born to Run", artist: "Bruce Springsteen", genre: "Rock", era: "old", tempo: "fast", year: 1975 },
            { title: "Like a Rolling Stone", artist: "Bob Dylan", genre: "Rock", era: "old", tempo: "medium", year: 1965 },
            { title: "Purple Haze", artist: "Jimi Hendrix", genre: "Rock", era: "old", tempo: "fast", year: 1967 },
            { title: "Free Bird", artist: "Lynyrd Skynyrd", genre: "Rock", era: "old", tempo: "slow", year: 1973 },
            { title: "Satisfaction", artist: "The Rolling Stones", genre: "Rock", era: "old", tempo: "medium", year: 1965 },
            { title: "Under the Bridge", artist: "Red Hot Chili Peppers", genre: "Rock", era: "old", tempo: "slow", year: 1991 },
            { title: "Creep", artist: "Radiohead", genre: "Rock", era: "old", tempo: "slow", year: 1992 },
            { title: "Seven Nation Army", artist: "The White Stripes", genre: "Rock", era: "old", tempo: "medium", year: 2003 },
            { title: "Another Brick in the Wall", artist: "Pink Floyd", genre: "Rock", era: "old", tempo: "medium", year: 1979 },
            { title: "Dream On", artist: "Aerosmith", genre: "Rock", era: "old", tempo: "slow", year: 1973 },
            { title: "Mr. Brightside", artist: "The Killers", genre: "Rock", era: "old", tempo: "fast", year: 2003 },
            { title: "Whole Lotta Love", artist: "Led Zeppelin", genre: "Rock", era: "old", tempo: "medium", year: 1969 },
            { title: "Livin' on a Prayer", artist: "Bon Jovi", genre: "Rock", era: "old", tempo: "fast", year: 1986 },

            // HIP HOP / RAP
            { title: "Luther", artist: "Kendrick Lamar ft. SZA", genre: "Hip Hop / Rap", era: "new", tempo: "medium", year: 2024 },
            { title: "Juicy", artist: "The Notorious B.I.G.", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 1994 },
            { title: "Lose Yourself", artist: "Eminem", genre: "Hip Hop / Rap", era: "old", tempo: "fast", year: 2002 },
            { title: "California Love", artist: "2Pac ft. Dr. Dre", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 1995 },
            { title: "Nuthin' but a 'G' Thang", artist: "Dr. Dre ft. Snoop Dogg", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 1992 },
            { title: "Alright", artist: "Kendrick Lamar", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 2015 },
            { title: "C.R.E.A.M.", artist: "Wu-Tang Clan", genre: "Hip Hop / Rap", era: "old", tempo: "slow", year: 1993 },
            { title: "Straight Outta Compton", artist: "N.W.A.", genre: "Hip Hop / Rap", era: "old", tempo: "fast", year: 1988 },
            { title: "Rapper's Delight", artist: "The Sugarhill Gang", genre: "Hip Hop / Rap", era: "old", tempo: "fast", year: 1979 },
            { title: "Sicko Mode", artist: "Travis Scott", genre: "Hip Hop / Rap", era: "new", tempo: "fast", year: 2018 },
            { title: "Empire State of Mind", artist: "Jay-Z ft. Alicia Keys", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 2009 },
            { title: "God's Plan", artist: "Drake", genre: "Hip Hop / Rap", era: "new", tempo: "medium", year: 2018 },
            { title: "Ms. Jackson", artist: "Outkast", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 2000 },
            { title: "Gold Digger", artist: "Kanye West", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 2005 },
            { title: "Humble", artist: "Kendrick Lamar", genre: "Hip Hop / Rap", era: "new", tempo: "fast", year: 2017 },
            { title: "In Da Club", artist: "50 Cent", genre: "Hip Hop / Rap", era: "old", tempo: "fast", year: 2003 },
            { title: "Stan", artist: "Eminem", genre: "Hip Hop / Rap", era: "old", tempo: "slow", year: 2000 },
            { title: "Changes", artist: "2Pac", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 1998 },
            { title: "Mind Playing Tricks on Me", artist: "Geto Boys", genre: "Hip Hop / Rap", era: "old", tempo: "medium", year: 1991 },

            // COUNTRY
            { title: "A Bar Song (Tipsy)", artist: "Shaboozey", genre: "Country", era: "new", tempo: "medium", year: 2024 },
            { title: "He Stopped Loving Her Today", artist: "George Jones", genre: "Country", era: "old", tempo: "slow", year: 1980 },
            { title: "I Will Always Love You", artist: "Dolly Parton", genre: "Country", era: "old", tempo: "slow", year: 1974 },
            { title: "Ring of Fire", artist: "Johnny Cash", genre: "Country", era: "old", tempo: "medium", year: 1963 },
            { title: "Jolene", artist: "Dolly Parton", genre: "Country", era: "old", tempo: "fast", year: 1973 },
            { title: "Friends in Low Places", artist: "Garth Brooks", genre: "Country", era: "old", tempo: "medium", year: 1990 },
            { title: "Tennessee Whiskey", artist: "Chris Stapleton", genre: "Country", era: "new", tempo: "slow", year: 2015 },
            { title: "Man! I Feel Like a Woman!", artist: "Shania Twain", genre: "Country", era: "old", tempo: "fast", year: 1997 },
            { title: "The Gambler", artist: "Kenny Rogers", genre: "Country", era: "old", tempo: "medium", year: 1978 },
            { title: "Crazy", artist: "Patsy Cline", genre: "Country", era: "old", tempo: "slow", year: 1961 },
            { title: "Always on My Mind", artist: "Willie Nelson", genre: "Country", era: "old", tempo: "slow", year: 1982 },
            { title: "Stand by Your Man", artist: "Tammy Wynette", genre: "Country", era: "old", tempo: "medium", year: 1968 },
            { title: "Mean", artist: "Taylor Swift", genre: "Country", era: "old", tempo: "medium", year: 2010 },
            { title: "Blue Eyes Crying in the Rain", artist: "Willie Nelson", genre: "Country", era: "old", tempo: "slow", year: 1975 },
            { title: "Fancy", artist: "Reba McEntire", genre: "Country", era: "old", tempo: "medium", year: 1990 },
            { title: "I'm So Lonesome I Could Cry", artist: "Hank Williams", genre: "Country", era: "old", tempo: "slow", year: 1949 },
            { title: "Before He Cheats", artist: "Carrie Underwood", genre: "Country", era: "old", tempo: "medium", year: 2005 },
            { title: "The House That Built Me", artist: "Miranda Lambert", genre: "Country", era: "old", tempo: "slow", year: 2009 },

            // R&B / SOUL
            { title: "Respect", artist: "Aretha Franklin", genre: "R&B / Soul", era: "old", tempo: "medium", year: 1967 },
            { title: "What's Going On", artist: "Marvin Gaye", genre: "R&B / Soul", era: "old", tempo: "medium", year: 1971 },
            { title: "Superstition", artist: "Stevie Wonder", genre: "R&B / Soul", era: "old", tempo: "fast", year: 1972 },
            { title: "Lose Control", artist: "Teddy Swims", genre: "R&B / Soul", era: "new", tempo: "slow", year: 2023 },
            { title: "Let's Get It On", artist: "Marvin Gaye", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1973 },
            { title: "Stayin' Alive", artist: "Bee Gees", genre: "R&B / Soul", era: "old", tempo: "medium", year: 1977 },
            { title: "Killing Me Softly", artist: "Fugees", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1996 },
            { title: "If I Ain't Got You", artist: "Alicia Keys", genre: "R&B / Soul", era: "old", tempo: "slow", year: 2003 },
            { title: "Purple Rain", artist: "Prince", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1984 },
            { title: "No Guidance", artist: "Chris Brown ft. Drake", genre: "R&B / Soul", era: "new", tempo: "medium", year: 2019 },
            { title: "Kiss from a Rose", artist: "Seal", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1994 },
            { title: "U Remind Me", artist: "Usher", genre: "R&B / Soul", era: "old", tempo: "medium", year: 2001 },
            { title: "Cranes in the Sky", artist: "Solange", genre: "R&B / Soul", era: "new", tempo: "slow", year: 2016 },
            { title: "Adorn", artist: "Miguel", genre: "R&B / Soul", era: "old", tempo: "medium", year: 2012 },
            { title: "At Last", artist: "Etta James", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1960 },
            { title: "Lean on Me", artist: "Bill Withers", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1972 },
            { title: "A Change is Gonna Come", artist: "Sam Cooke", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1964 },
            { title: "End of the Road", artist: "Boyz II Men", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1992 },
            { title: "Weak", artist: "SWV", genre: "R&B / Soul", era: "old", tempo: "slow", year: 1992 },

            // JAZZ
            { title: "Take Five", artist: "Dave Brubeck", genre: "Jazz", era: "old", tempo: "medium", year: 1959 },
            { title: "So What", artist: "Miles Davis", genre: "Jazz", era: "old", tempo: "medium", year: 1959 },
            { title: "Strange Fruit", artist: "Billie Holiday", genre: "Jazz", era: "old", tempo: "slow", year: 1939 },
            { title: "What a Wonderful World", artist: "Louis Armstrong", genre: "Jazz", era: "old", tempo: "slow", year: 1967 },
            { title: "Autumn Leaves", artist: "Nat King Cole", genre: "Jazz", era: "old", tempo: "slow", year: 1955 },
            { title: "Fly Me to the Moon", artist: "Frank Sinatra", genre: "Jazz", era: "old", tempo: "medium", year: 1964 },
            { title: "The Girl from Ipanema", artist: "Stan Getz", genre: "Jazz", era: "old", tempo: "slow", year: 1962 },
            { title: "My Favorite Things", artist: "John Coltrane", genre: "Jazz", era: "old", tempo: "medium", year: 1961 },
            { title: "Sing, Sing, Sing", artist: "Benny Goodman", genre: "Jazz", era: "old", tempo: "fast", year: 1937 },
            { title: "Summertime", artist: "Ella Fitzgerald", genre: "Jazz", era: "old", tempo: "slow", year: 1958 },
            { title: "Blue Rondo à la Turk", artist: "Dave Brubeck", genre: "Jazz", era: "old", tempo: "fast", year: 1959 },
            { title: "A Love Supreme", artist: "John Coltrane", genre: "Jazz", era: "old", tempo: "slow", year: 1965 },
            { title: "Giant Steps", artist: "John Coltrane", genre: "Jazz", era: "old", tempo: "fast", year: 1960 },
            { title: "Cantaloupe Island", artist: "Herbie Hancock", genre: "Jazz", era: "old", tempo: "medium", year: 1964 },
            { title: "Birdland", artist: "Weather Report", genre: "Jazz", era: "old", tempo: "fast", year: 1977 },
            { title: "God Bless the Child", artist: "Billie Holiday", genre: "Jazz", era: "old", tempo: "slow", year: 1941 },
            { title: "Moanin'", artist: "Art Blakey", genre: "Jazz", era: "old", tempo: "medium", year: 1958 },
            { title: "Misty", artist: "Erroll Garner", genre: "Jazz", era: "old", tempo: "slow", year: 1954 },
            { title: "'Round Midnight", artist: "Thelonious Monk", genre: "Jazz", era: "old", tempo: "slow", year: 1944 },

            // BLUES
            { title: "The Thrill is Gone", artist: "B.B. King", genre: "Blues", era: "old", tempo: "slow", year: 1969 },
            { title: "Hoochie Coochie Man", artist: "Muddy Waters", genre: "Blues", era: "old", tempo: "medium", year: 1954 },
            { title: "Sweet Home Chicago", artist: "Robert Johnson", genre: "Blues", era: "old", tempo: "fast", year: 1936 },
            { title: "Cross Road Blues", artist: "Robert Johnson", genre: "Blues", era: "old", tempo: "medium", year: 1936 },
            { title: "Smokestack Lightnin'", artist: "Howlin' Wolf", genre: "Blues", era: "old", tempo: "slow", year: 1956 },
            { title: "Red House", artist: "Jimi Hendrix", genre: "Blues", era: "old", tempo: "slow", year: 1967 },
            { title: "Born Under a Bad Sign", artist: "Albert King", genre: "Blues", era: "old", tempo: "medium", year: 1967 },
            { title: "Damn Right, I've Got the Blues", artist: "Buddy Guy", genre: "Blues", era: "old", tempo: "fast", year: 1991 },
            { title: "I'd Rather Go Blind", artist: "Etta James", genre: "Blues", era: "old", tempo: "slow", year: 1967 },
            { title: "Texas Flood", artist: "Stevie Ray Vaughan", genre: "Blues", era: "old", tempo: "medium", year: 1983 },
            { title: "Mannish Boy", artist: "Muddy Waters", genre: "Blues", era: "old", tempo: "medium", year: 1955 },
            { title: "Statesboro Blues", artist: "The Allman Brothers Band", genre: "Blues", era: "old", tempo: "fast", year: 1971 },
            { title: "Killing Floor", artist: "Howlin' Wolf", genre: "Blues", era: "old", tempo: "fast", year: 1964 },
            { title: "Stormy Monday", artist: "T-Bone Walker", genre: "Blues", era: "old", tempo: "slow", year: 1947 },
            { title: "Boom Boom", artist: "John Lee Hooker", genre: "Blues", era: "old", tempo: "fast", year: 1962 },
            { title: "Ball and Chain", artist: "Janis Joplin", genre: "Blues", era: "old", tempo: "slow", year: 1968 },
            { title: "Goin' Down", artist: "Freddie King", genre: "Blues", era: "old", tempo: "fast", year: 1971 },
            { title: "Dust My Broom", artist: "Elmore James", genre: "Blues", era: "old", tempo: "fast", year: 1951 },

            // ELECTRONIC / EDM
            { title: "One More Time", artist: "Daft Punk", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2000 },
            { title: "Levels", artist: "Avicii", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2011 },
            { title: "Titanium", artist: "David Guetta ft. Sia", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2011 },
            { title: "Wake Me Up", artist: "Avicii", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2013 },
            { title: "Scary Monsters and Nice Sprites", artist: "Skrillex", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2010 },
            { title: "Blue Monday", artist: "New Order", genre: "Electronic / EDM", era: "old", tempo: "medium", year: 1983 },
            { title: "Around the World", artist: "Daft Punk", genre: "Electronic / EDM", era: "old", tempo: "medium", year: 1997 },
            { title: "Strobe", artist: "Deadmau5", genre: "Electronic / EDM", era: "old", tempo: "slow", year: 2009 },
            { title: "Don't You Worry Child", artist: "Swedish House Mafia", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2012 },
            { title: "Lean On", artist: "Major Lazer & DJ Snake", genre: "Electronic / EDM", era: "old", tempo: "medium", year: 2015 },
            { title: "Clarity", artist: "Zedd ft. Foxes", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2012 },
            { title: "Animals", artist: "Martin Garrix", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2013 },
            { title: "Sandstorm", artist: "Darude", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 1999 },
            { title: "Ghosts 'n' Stuff", artist: "Deadmau5", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 2008 },
            { title: "Electricity", artist: "Silk City & Dua Lipa", genre: "Electronic / EDM", era: "new", tempo: "medium", year: 2018 },
            { title: "Innerbloom", artist: "RÜFÜS DU SOL", genre: "Electronic / EDM", era: "new", tempo: "slow", year: 2016 },
            { title: "Faded", artist: "Alan Walker", genre: "Electronic / EDM", era: "new", tempo: "slow", year: 2015 },
            { title: "Windowlicker", artist: "Aphex Twin", genre: "Electronic / EDM", era: "old", tempo: "medium", year: 1999 },
            { title: "Firestarter", artist: "The Prodigy", genre: "Electronic / EDM", era: "old", tempo: "fast", year: 1996 },

            // REGGAE
            { title: "No Woman, No Cry", artist: "Bob Marley", genre: "Reggae", era: "old", tempo: "slow", year: 1974 },
            { title: "One Love", artist: "Bob Marley", genre: "Reggae", era: "old", tempo: "medium", year: 1977 },
            { title: "Three Little Birds", artist: "Bob Marley", genre: "Reggae", era: "old", tempo: "medium", year: 1977 },
            { title: "Redemption Song", artist: "Bob Marley", genre: "Reggae", era: "old", tempo: "slow", year: 1980 },
            { title: "Buffalo Soldier", artist: "Bob Marley", genre: "Reggae", era: "old", tempo: "medium", year: 1983 },
            { title: "The Tide is High", artist: "The Paragons", genre: "Reggae", era: "old", tempo: "medium", year: 1967 },
            { title: "Pressure Drop", artist: "Toots & The Maytals", genre: "Reggae", era: "old", tempo: "fast", year: 1969 },
            { title: "Police and Thieves", artist: "Junior Murvin", genre: "Reggae", era: "old", tempo: "medium", year: 1976 },
            { title: "Many Rivers to Cross", artist: "Jimmy Cliff", genre: "Reggae", era: "old", tempo: "slow", year: 1969 },
            { title: "Night Nurse", artist: "Gregory Isaacs", genre: "Reggae", era: "old", tempo: "slow", year: 1982 },
            { title: "Bam Bam", artist: "Sister Nancy", genre: "Reggae", era: "old", tempo: "medium", year: 1982 },
            { title: "Welcome to Jamrock", artist: "Damian Marley", genre: "Reggae", era: "old", tempo: "medium", year: 2005 },
            { title: "Hold Me Tight", artist: "Johnny Nash", genre: "Reggae", era: "old", tempo: "medium", year: 1968 },
            { title: "I Shot the Sheriff", artist: "Bob Marley", genre: "Reggae", era: "old", tempo: "medium", year: 1973 },
            { title: "Legalize It", artist: "Peter Tosh", genre: "Reggae", era: "old", tempo: "medium", year: 1976 },
            { title: "Rivers of Babylon", artist: "The Melodians", genre: "Reggae", era: "old", tempo: "slow", year: 1970 },
            { title: "54-46 That's My Number", artist: "Toots & The Maytals", genre: "Reggae", era: "old", tempo: "fast", year: 1968 },
            { title: "Israelites", artist: "Desmond Dekker", genre: "Reggae", era: "old", tempo: "fast", year: 1968 },
            { title: "Cherry Oh Baby", artist: "Eric Donaldson", genre: "Reggae", era: "old", tempo: "medium", year: 1971 },
            { title: "Wonderful World, Beautiful People", artist: "Jimmy Cliff", genre: "Reggae", era: "old", tempo: "medium", year: 1969 },

            // FOLK
            { title: "The Sound of Silence", artist: "Simon & Garfunkel", genre: "Folk", era: "old", tempo: "slow", year: 1964 },
            { title: "Blowin' in the Wind", artist: "Bob Dylan", genre: "Folk", era: "old", tempo: "slow", year: 1963 },
            { title: "Fast Car", artist: "Tracy Chapman", genre: "Folk", era: "old", tempo: "slow", year: 1988 },
            { title: "Big Yellow Taxi", artist: "Joni Mitchell", genre: "Folk", era: "old", tempo: "fast", year: 1970 },
            { title: "Leaving on a Jet Plane", artist: "John Denver", genre: "Folk", era: "old", tempo: "slow", year: 1966 },
            { title: "Hallelujah", artist: "Leonard Cohen", genre: "Folk", era: "old", tempo: "slow", year: 1984 },
            { title: "Stick Season", artist: "Noah Kahan", genre: "Folk", era: "new", tempo: "medium", year: 2022 },
            { title: "Skinny Love", artist: "Bon Iver", genre: "Folk", era: "old", tempo: "slow", year: 2007 },
            { title: "The Boxer", artist: "Simon & Garfunkel", genre: "Folk", era: "old", tempo: "medium", year: 1969 },
            { title: "Suzanne", artist: "Leonard Cohen", genre: "Folk", era: "old", tempo: "slow", year: 1967 },
            { title: "Both Sides Now", artist: "Joni Mitchell", genre: "Folk", era: "old", tempo: "slow", year: 1969 },
            { title: "If I Had a Hammer", artist: "Pete Seeger", genre: "Folk", era: "old", tempo: "fast", year: 1949 },
            { title: "Heart of Gold", artist: "Neil Young", genre: "Folk", era: "old", tempo: "slow", year: 1972 },
            { title: "Fire and Rain", artist: "James Taylor", genre: "Folk", era: "old", tempo: "slow", year: 1970 },
            { title: "Luka", artist: "Suzanne Vega", genre: "Folk", era: "old", tempo: "medium", year: 1987 },
            { title: "Morning Has Broken", artist: "Cat Stevens", genre: "Folk", era: "old", tempo: "slow", year: 1971 },
            { title: "Universal Soldier", artist: "Buffy Sainte-Marie", genre: "Folk", era: "old", tempo: "slow", year: 1964 },
            { title: "Diamonds and Rust", artist: "Joan Baez", genre: "Folk", era: "old", tempo: "slow", year: 1975 },
            { title: "Wild World", artist: "Cat Stevens", genre: "Folk", era: "old", tempo: "slow", year: 1970 },
            { title: "Little Boxes", artist: "Malvina Reynolds", genre: "Folk", era: "old", tempo: "medium", year: 1962 }
        ];

        let filtered = songs.filter(song => {
            const isGenreMatch = song.genre === prefs.genre;
            const isEraMatch = song.era === prefs.era;
            const isTempoMatch = song.tempo === prefs.tempo;
            return isGenreMatch && isEraMatch && isTempoMatch;
        });

        if (filtered.length === 0) {
            filtered = songs.filter(song => song.genre === prefs.genre && song.era === prefs.era);
        }

        if (filtered.length === 0) {
            filtered = songs.filter(song => song.genre === prefs.genre);
        }

        const shuffled = this.shuffle(filtered);
        const song = shuffled[0] || songs[0];

        return {
            ...song,
            url: `https://open.spotify.com/search/${encodeURIComponent(song.title + " " + song.artist)}`,
            tempoVal: song.tempo === 'slow' ? 70 : (song.tempo === 'medium' ? 100 : 130)
        };
    }
}

const engine = new MusicEngine();

if (musicForm) {
    musicForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = musicForm.querySelector("button");
        const originalText = btn.textContent;
        btn.textContent = "Analyzing Audio DNA...";
        btn.disabled = true;

        const prefs = {
            genre: document.getElementById("genre").value,
            era: document.getElementById("era").value,
            tempo: document.getElementById("tempo").value
        };

        const track = await engine.getRecommendations(prefs);
        displayResult(track);

        btn.textContent = originalText;
        btn.disabled = false;
    });
}

function displayResult(track) {
    modalBody.innerHTML = `
        <div class="track-card">
            <h4>${track.title}</h4>
            <p>${track.artist}</p>
            <div class="track-meta" style="display: flex; gap: 1rem; justify-content: center; margin: 1rem 0; font-size: 0.9rem; color: var(--accent);">
                <span>${track.year}</span>
                <span>${track.genre}</span>
            </div>
            <a href="${track.url}" target="_blank" class="spotify-link">Listen on Spotify</a>
        </div>
    `;
    musicModal.classList.add("active");
}

if (closeModal) {
    closeModal.addEventListener("click", () => {
        musicModal.classList.remove("active");
    });
}

window.addEventListener("click", (e) => {
    if (e.target === musicModal) {
        musicModal.classList.remove("active");
    }
});
/* MOBILE MENU TOGGLE */
const menuToggle = document.querySelector(".mobile-menu-toggle");
const navUl = document.querySelector("nav ul");
const navLinksArr = document.querySelectorAll("nav ul li a");

if (menuToggle && navUl) {
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navUl.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navLinksArr.forEach(link => {
        link.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            navUl.classList.remove("active");
        });
    });
}
