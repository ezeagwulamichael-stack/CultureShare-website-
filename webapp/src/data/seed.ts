import type { Community, Conversation, Notification, Post, Scroll, Status, Topic, User, Comment } from './types'

const H = 3600_000
const now = Date.now()
const ago = (h: number) => now - h * H

/** Image URL relative to the app base, so the build also works from a plain file or sub-path. */
export const asset = (file: string) => `${import.meta.env.BASE_URL}img/${file}`
export const img = (name: string) => asset(`${name}.webp`)

/* ─────────── People ─────────── */
export const USERS: User[] = [
  { id: 'amaradia', name: 'Amara Dia', username: 'amaradia123', avatar: img('s-amara'), flag: '🇬🇭', country: 'Ghana', state: 'Ashanti', tribe: 'Akan', tagline: 'Forever a Ghanaian', bio: 'West African textile scholar. Kente, adinkra and the cloth that speaks.', role: 'creator', verified: true, raiders: 12480, raiding: 312, specialty: 'West African textiles', cover: img('aso-oke-women') },
  { id: 'kofi', name: 'Dr. Kofi Mensah', username: 'drkofi', avatar: img('p-abena'), flag: '🇬🇭', country: 'Ghana', state: 'Ashanti', tribe: 'Akan', tagline: 'Verified Historian', bio: 'Historian & cultural archivist. Documenting Akan traditions for future generations.', role: 'historian', verified: true, raiders: 38211, raiding: 140, specialty: 'West African History', cover: img('akan-festival') },
  { id: 'amara-okafor', name: 'Amara Okafor', username: 'amaraokafor', avatar: img('p-amara'), flag: '🇳🇬', country: 'Nigeria', state: 'Oyo', tribe: 'Yoruba', tagline: 'Yoruba Oral Tradition', bio: 'Keeper of oríkì — praise poetry passed from my grandmother’s mouth to mine.', role: 'creator', verified: true, raiders: 8210, raiding: 401, specialty: 'Yoruba Oral Tradition' },
  { id: 'tariro', name: 'Dr. Tariro Chikanda', username: 'tariro.c', avatar: img('p-tariro'), flag: '🇿🇼', country: 'Zimbabwe', state: 'Masvingo', tribe: 'Shona', tagline: 'Shona & Zimbabwean Culture', bio: 'Historian of Great Zimbabwe and the Shona mbira tradition.', role: 'historian', verified: true, raiders: 15402, raiding: 98, specialty: 'Shona & Zimbabwean Culture', cover: img('great-zimbabwe') },
  { id: 'kwame', name: 'Kwame Asante', username: 'kwame.a', avatar: img('p-kofi'), flag: '🇬🇭', country: 'Ghana', state: 'Greater Accra', tribe: 'Akan', tagline: 'Storyteller', bio: 'I tell the stories our grandparents told us — at the fireside and on camera.', role: 'creator', verified: true, raiders: 5402, raiding: 230 },
  { id: 'adaeze', name: 'Adaeze Nwosu', username: 'adaeze.nwosu', avatar: img('s-gracie'), flag: '🇳🇬', country: 'Nigeria', state: 'Anambra', tribe: 'Igbo', tagline: 'Food is memory', bio: 'Recording my grandmother’s kitchen before it is gone.', role: 'creator', verified: true, raiders: 9120, raiding: 188 },
  { id: 'sade', name: 'Sade Lagos', username: 'sade.lagos', avatar: img('s-marian'), flag: '🇳🇬', country: 'Nigeria', state: 'Lagos', tribe: 'Yoruba', tagline: 'Songs we grew up with', bio: 'Collecting the lullabies, work songs and owambe anthems of Yorubaland.', role: 'creator', verified: false, raiders: 3301, raiding: 512 },
  { id: 'kamau', name: 'Kamau Rift', username: 'kamau.rift', avatar: img('s-george'), flag: '🇰🇪', country: 'Kenya', state: 'Kajiado', tribe: 'Maasai', tagline: 'Rift Valley stories', bio: 'Photographer documenting Maasai rites of passage with my elders’ blessing.', role: 'creator', verified: true, raiders: 7740, raiding: 160 },
  { id: 'nana', name: 'Nana Adwoa', username: 'nana.adwoa', avatar: img('s-ghana'), flag: '🇬🇭', country: 'Ghana', state: 'Ashanti', tribe: 'Akan', tagline: 'Symbols & meaning', bio: 'Every adinkra symbol is a proverb. I explain one a week.', role: 'creator', verified: true, raiders: 4420, raiding: 77 },
  { id: 'yuki', name: 'Yuki Tanaka', username: 'yukitanaka', avatar: img('s-peterson'), flag: '🇳🇬', country: 'Nigeria', state: 'Lagos', tribe: 'Yoruba', tagline: 'Being creatively Nigerian', bio: 'Japanese-Nigerian. Two cultures, one camera.', role: 'creator', verified: true, raiders: 2210, raiding: 340 },
  { id: 'danilo', name: 'Danilo Sanni', username: 'danilosanni', avatar: img('w-3'), flag: '🇳🇬', country: 'Nigeria', state: 'Ogun', tribe: 'Yoruba', tagline: 'Oral transmission', bio: 'Griot sounds, field recordings and the music in between.', role: 'creator', verified: false, raiders: 1870, raiding: 290 },
  { id: 'fatima', name: 'Fatima Al-Rashid', username: 'fatima.ar', avatar: img('w-6'), flag: '🇸🇩', country: 'Sudan', state: 'Khartoum', tribe: 'Nubian', tagline: 'Nubian heritage', bio: 'Comparative governance across African kingdoms.', role: 'creator', verified: true, raiders: 2980, raiding: 210 },
  { id: 'amara-diallo', name: 'Amara Diallo', username: 'amara.diallo', avatar: img('w-5'), flag: '🇬🇭', country: 'Ghana', state: 'Ashanti', tribe: 'Akan', tagline: 'Community admin', bio: 'Admin of the Akan Heritage Circle.', role: 'member', verified: true, raiders: 940, raiding: 120 },
  { id: 'tunde', name: 'Tunde Bakare', username: 'tunde.b', avatar: img('p-tunde'), flag: '🇳🇬', country: 'Nigeria', state: 'Kwara', tribe: 'Yoruba', tagline: 'Afrobeats archivist', bio: 'From Fela to now — the lineage of Afrobeats.', role: 'creator', verified: false, raiders: 1204, raiding: 600 },
  { id: 'zola', name: 'Zola Ndlovu', username: 'zola.n', avatar: img('w-2'), flag: '🇿🇦', country: 'South Africa', state: 'KwaZulu-Natal', tribe: 'Zulu', tagline: 'Zulu kingdom stories', bio: 'Umlando — our history, told by us.', role: 'creator', verified: true, raiders: 6120, raiding: 180 },
  { id: 'imane', name: 'Imane Ait', username: 'imane.ait', avatar: img('w-1'), flag: '🇲🇦', country: 'Morocco', state: 'Souss-Massa', tribe: 'Amazigh', tagline: 'Amazigh weddings', bio: 'Tifinagh, henna and the songs of the Atlas.', role: 'creator', verified: false, raiders: 1550, raiding: 98 },
  // featured artists (onboarding "What sounds move you?")
  { id: 'burna', name: 'Burna Boy', username: 'burnaboy', avatar: img('a-burna'), flag: '🇳🇬', country: 'Nigeria', tribe: 'Yoruba', tagline: 'Artist', role: 'artist', verified: true, raiders: 1_200_000, raiding: 12 },
  { id: 'tems', name: 'Tems', username: 'temsbaby', avatar: img('a-tems'), flag: '🇳🇬', country: 'Nigeria', tribe: 'Yoruba', tagline: 'Artist', role: 'artist', verified: true, raiders: 980_000, raiding: 30 },
  { id: 'femi', name: 'Femi Kuti', username: 'femikuti', avatar: img('a-femi'), flag: '🇳🇬', country: 'Nigeria', tribe: 'Yoruba', tagline: 'Artist', role: 'artist', verified: true, raiders: 410_000, raiding: 50 },
  { id: 'yemi', name: 'Yemi Alade', username: 'yemialade', avatar: img('a-yemi'), flag: '🇳🇬', country: 'Nigeria', tribe: 'Igbo', tagline: 'Artist', role: 'artist', verified: true, raiders: 760_000, raiding: 44 },
  { id: 'blackcoffee', name: 'Black Coffee', username: 'realblackcoffee', avatar: img('a-blackcoffee'), flag: '🇿🇦', country: 'South Africa', tribe: 'Xhosa', tagline: 'Artist', role: 'artist', verified: true, raiders: 650_000, raiding: 21 },
  { id: 'khaled', name: 'Khaled', username: 'khaled', avatar: img('a-khaled'), flag: '🇩🇿', country: 'Algeria', tribe: 'Arab-Berber', tagline: 'Artist', role: 'artist', verified: true, raiders: 540_000, raiding: 18 },
]

export const FEATURED_ARTISTS = ['burna', 'tems', 'femi', 'yemi', 'blackcoffee', 'khaled']

/* ─────────── Scrolls (the central object) ─────────── */
const KENTE =
  'Kente weaving is more than cloth — it is language. Each pattern tells the story of our ancestors and speaks across generations. The colours are chosen deliberately: gold for royalty and wealth, green for growth and renewal, black for maturity and the spiritual energy of the ancestors. When a weaver sets up the loom, they are writing a sentence that their great-grandchildren will be able to read.'

export const SCROLLS: Scroll[] = [
  { id: 'language-of-kente', title: 'The Language of Kente', creatorId: 'amaradia', kind: 'documentary', media: 'image', images: [img('aso-oke-women'), img('kente-weaving'), img('akan-festival'), img('oba-tusks')], caption: 'Thread by thread — how Kente became a language. Each colour, each pattern, a sentence. The cloth speaks what words cannot.\n\n' + KENTE, country: 'Ghana', flag: '🇬🇭', tribe: 'Akan', category: 'Arts', tags: ['Kente', 'Akan', 'Ghana', 'Weaving', 'Cultural Heritage'], historianId: 'kofi', likes: 2841, comments: 123, saves: 318, views: 123400, createdAt: ago(2), visibility: 'public', status: 'published' },
  { id: 'ofe-onugbu', title: 'How My Grandmother Made Ofe Onugbu', creatorId: 'adaeze', kind: 'reel', media: 'video', images: [img('ofe-onugbu'), img('dish-west')], duration: '8:24', caption: 'Bitter leaf soup the way Nne made it — washed until the bitterness becomes a memory. She never measured anything; she listened to the pot.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Igbo', category: 'Food', tags: ['Igbo', 'Food', 'Ofe Onugbu', 'Recipes'], historianId: 'kofi', likes: 2841, comments: 123, saves: 318, views: 88200, createdAt: ago(5), visibility: 'public', status: 'published' },
  { id: 'kente-weaving', title: 'The Story of Kente Weaving', creatorId: 'kwame', kind: 'documentary', media: 'video', images: [img('kente-weaving'), img('akan-festival')], duration: '8:24', caption: KENTE, country: 'Ghana', flag: '🇬🇭', tribe: 'Akan', category: 'Arts', tags: ['Kente', 'Craft', 'Bonwire'], historianId: 'kofi', likes: 2841, comments: 123, saves: 318, views: 64100, createdAt: ago(9), visibility: 'public', status: 'published' },
  { id: 'griots-song', title: 'Songs We Grew Up With', creatorId: 'sade', kind: 'reel', media: 'audio', images: [img('songs-sky')], duration: '5:17', caption: 'The Griot’s Song — Oral Transmission. Lullabies my mother sang while plaiting my hair, recorded with her blessing.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Yoruba', category: 'Music', tags: ['Yoruba', 'Music', 'Oral History'], historianId: 'tariro', likes: 2841, comments: 123, saves: 318, views: 40300, createdAt: ago(12), visibility: 'public', status: 'published' },
  { id: 'maasai-ceremony', title: 'Inside a Maasai Coming-of-Age Ceremony', creatorId: 'kamau', kind: 'documentary', media: 'video', images: [img('maasai-ceremony')], duration: '12:40', caption: 'Eunoto marks the passage from warrior to elder. My uncles allowed me to film the parts outsiders may see.', country: 'Kenya', flag: '🇰🇪', tribe: 'Maasai', category: 'Traditions', tags: ['Maasai', 'Rites', 'Kenya'], historianId: 'tariro', likes: 3120, comments: 210, saves: 402, views: 98000, createdAt: ago(20), visibility: 'public', status: 'published' },
  { id: 'adinkra-meaning', title: 'What This Symbol Means in Akan Culture', creatorId: 'nana', kind: 'reel', media: 'image', images: [img('adinkra')], caption: 'Sankofa — “go back and fetch it.” It is not wrong to return for what you have forgotten.', country: 'Ghana', flag: '🇬🇭', tribe: 'Akan', category: 'Stories', tags: ['Adinkra', 'Symbols', 'Sankofa'], historianId: 'kofi', likes: 1980, comments: 88, saves: 512, views: 52100, createdAt: ago(26), visibility: 'public', status: 'published' },
  { id: 'durbar', title: 'Durbar: When the Emirs Ride', creatorId: 'yuki', kind: 'reel', media: 'video', images: [img('chief-on-horse'), img('emir-durbar')], duration: '3:42', caption: 'The Sallah Durbar is a cavalry parade older than the nation. Horses dressed like kings, riders dressed like history.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Hausa', category: 'Festivals', tags: ['Durbar', 'Hausa', 'Festivals'], historianId: 'kofi', likes: 4210, comments: 302, saves: 600, views: 150200, createdAt: ago(30), visibility: 'public', status: 'published' },
  { id: 'great-zimbabwe', title: 'Great Zimbabwe Was Built By Us', creatorId: 'tariro', kind: 'documentary', media: 'image', images: [img('great-zimbabwe'), img('mud-huts')], caption: 'For a century, colonial historians refused to believe Africans built these walls. The stones remember who laid them.', country: 'Zimbabwe', flag: '🇿🇼', tribe: 'Shona', category: 'History', tags: ['Shona', 'Great Zimbabwe', 'History'], historianId: 'tariro', likes: 6120, comments: 540, saves: 1302, views: 210000, createdAt: ago(40), visibility: 'public', status: 'published', darkZone: { state: 'discussion', reason: 'Contested historical claims flagged by algorithmic check; open for moderated discussion.' } },
  { id: 'oba-court', title: 'The Oba’s Court', creatorId: 'amara-okafor', kind: 'reel', media: 'image', images: [img('oba-tusks'), img('bronze-artifacts')], caption: 'Ivory, coral and bronze. The royal court is a museum that never closed.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Edo', category: 'Monarchs', tags: ['Benin', 'Royalty', 'Bronzes'], historianId: 'kofi', likes: 3330, comments: 140, saves: 410, views: 71000, createdAt: ago(52), visibility: 'public', status: 'published', price: 2500, sale: 'available' },
  { id: 'egungun', title: 'Egungun: The Ancestors Return', creatorId: 'danilo', kind: 'documentary', media: 'video', images: [img('egungun-village')], duration: '14:05', caption: 'Once a year, the ancestors walk among us in cloth. A field recording from Ogun State.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Yoruba', category: 'Belief', tags: ['Egungun', 'Yoruba', 'Masquerade'], historianId: 'kofi', likes: 2210, comments: 410, saves: 220, views: 39000, createdAt: ago(60), visibility: 'public', status: 'published', darkZone: { state: 'under_scrutiny', reason: 'Sacred content — under scrutiny for whether filming is permitted by custodians.' } },
  { id: 'amazigh-wedding', title: 'An Amazigh Wedding in the Atlas', creatorId: 'imane', kind: 'reel', media: 'image', images: [img('amazigh-brides')], caption: 'Three days of henna, silver and song.', country: 'Morocco', flag: '🇲🇦', tribe: 'Amazigh', category: 'Marriage', tags: ['Amazigh', 'Weddings'], historianId: 'tariro', likes: 1540, comments: 64, saves: 190, views: 22000, createdAt: ago(70), visibility: 'public', status: 'published' },
  { id: 'zulu-reed', title: 'Umkhosi Womhlanga', creatorId: 'zola', kind: 'reel', media: 'video', images: [img('zulu-dance')], duration: '6:10', caption: 'The Reed Dance, explained by the women who dance it.', country: 'South Africa', flag: '🇿🇦', tribe: 'Zulu', category: 'Festivals', tags: ['Zulu', 'Reed Dance'], historianId: 'tariro', likes: 5010, comments: 288, saves: 640, views: 130000, createdAt: ago(80), visibility: 'public', status: 'published' },
  { id: 'beaded-bride', title: 'Beads That Speak', creatorId: 'zola', kind: 'reel', media: 'image', images: [img('beaded-bride')], caption: 'Every colour on a Zulu bride says something to the people who can read it.', country: 'South Africa', flag: '🇿🇦', tribe: 'Zulu', category: 'Ornaments', tags: ['Beadwork', 'Zulu'], historianId: 'tariro', likes: 1880, comments: 70, saves: 330, views: 18000, createdAt: ago(96), visibility: 'public', status: 'published' },
  { id: 'nupe-glass', title: 'Bida Glass Beads of the Nupe', creatorId: 'tunde', kind: 'documentary', media: 'image', images: [img('bronze-artifacts'), img('beaded-bride')], caption: 'In Bida, glass bead makers still melt bottles in clay furnaces. My uncle let me film the whole process from bottle to bead.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Nupe', category: 'Arts', tags: ['Nupe', 'Beads', 'Crafts'], historianId: 'kofi', likes: 0, comments: 0, saves: 0, views: 0, createdAt: ago(5), visibility: 'public', status: 'under_review', review: [{ by: 'culture_share', state: 'approved', at: ago(3) }, { by: 'historian', state: 'in_progress' }] },
  { id: 'ewe-kente', title: 'Ewe Kente Is Not Asante Kente', creatorId: 'nana', kind: 'reel', media: 'image', images: [img('kente-weaving')], caption: 'A short explainer on how Ewe weavers developed their own Kente tradition — the motifs, the looms, and the long rivalry.', country: 'Ghana', flag: '🇬🇭', tribe: 'Ewe', category: 'Arts', tags: ['Ewe', 'Kente'], historianId: 'kofi', likes: 0, comments: 0, saves: 0, views: 0, createdAt: ago(9), visibility: 'public', status: 'under_review', review: [{ by: 'culture_share', state: 'approved', at: ago(6) }, { by: 'historian', state: 'in_progress' }] },
  { id: 'yoruba-drums', title: 'The Talking Drum', creatorId: 'amara-okafor', kind: 'reel', media: 'video', images: [img('yoruba-drummers')], duration: '2:58', caption: 'Dùndún can mimic the tones of Yoruba speech. Listen — it is saying your oríkì.', country: 'Nigeria', flag: '🇳🇬', tribe: 'Yoruba', category: 'Music', tags: ['Yoruba', 'Dundun', 'Music'], historianId: 'kofi', likes: 3880, comments: 190, saves: 470, views: 99000, createdAt: ago(110), visibility: 'public', status: 'published' },
]

export const HISTORIAN_SCROLLS: Record<string, { title: string; meta: string; image: string; scrollId: string }[]> = {
  kofi: [
    { title: 'Meaning of Adinkra', meta: 'Ghana · Akan · Symbols', image: img('yoruba-drummers'), scrollId: 'adinkra-meaning' },
    { title: 'Ashanti Royal Courts', meta: 'Ghana · Akan · History', image: img('akan-festival'), scrollId: 'kente-weaving' },
    { title: 'The Kente Code', meta: 'Ghana · Akan · Craft', image: img('kongo-painting'), scrollId: 'language-of-kente' },
  ],
  tariro: [
    { title: 'Great Zimbabwe Was Built By Us', meta: 'Zimbabwe · Shona · History', image: img('great-zimbabwe'), scrollId: 'great-zimbabwe' },
    { title: 'Umkhosi Womhlanga', meta: 'South Africa · Zulu · Festivals', image: img('zulu-dance'), scrollId: 'zulu-reed' },
  ],
}

/* ─────────── Posts ─────────── */
export const POSTS: Post[] = [
  { id: 'p1', authorId: 'kwame', text: 'Did you know the Adinkra symbols each carry a specific philosophical meaning? I posted a detailed Scroll breaking down 20 of the most significant ones.', images: [], createdAt: ago(2), likes: 2841, comments: 123, saves: 40, communityId: 'akan-circle', visibility: 'public' },
  { id: 'p2', authorId: 'kofi', text: 'Reminder: This Sunday we host our monthly oral history sharing session. All community members are welcome to contribute.', images: [], createdAt: ago(3), likes: 2841, comments: 123, saves: 12, communityId: 'akan-circle', visibility: 'public' },
  { id: 'p3', authorId: 'fatima', text: 'Interested in collaborating on a cross-cultural Scroll comparing Akan and Hausa governance traditions. Who wants in?', images: [], createdAt: ago(4), likes: 2841, comments: 123, saves: 9, communityId: 'akan-circle', visibility: 'public' },
  { id: 'p4', authorId: 'yuki', text: 'Kente weaving is more than cloth — it is language. Each pattern tells the story of our ancestors and speaks across generations.', images: [img('chief-on-horse')], createdAt: ago(6), likes: 2841, comments: 123, saves: 318, visibility: 'public' },
  { id: 'p5', authorId: 'danilo', text: 'Kente weaving is more than cloth — it is language. Each pattern tells the story of our ancestors and speaks across generations. Field notes from Bonwire, where every family has a loom.', images: [], createdAt: ago(8), likes: 1201, comments: 44, saves: 51, visibility: 'public' },
  { id: 'p6', authorId: 'zola', text: 'Visited the Mgungundlovu heritage site this weekend. Standing where Dingane’s kraal stood is a different kind of history lesson.', images: [img('warriors-film'), img('sisters')], createdAt: ago(14), likes: 902, comments: 31, saves: 77, visibility: 'public' },
  { id: 'p7', authorId: 'amara-diallo', text: 'The Akan Heritage Festival Scroll competition is now open. Submit your best cultural documentation by 30 Jan.', images: [], createdAt: ago(1), likes: 410, comments: 22, saves: 15, communityId: 'akan-circle', visibility: 'public', announcement: true },
]

/* ─────────── Status (stories) ─────────── */
export const STATUSES: Status[] = [
  { id: 'st-amara', userId: 'amaradia', createdAt: ago(4), expiresAt: ago(4) + 24 * H, items: [
    { id: 's1', image: img('chief-on-horse'), caption: 'Thread by thread — how Kente became a language. Each colour, each pattern, a sentence. The cloth speaks what words cannot.', scrollId: 'language-of-kente' },
    { id: 's2', image: img('aso-oke-women'), caption: 'The women of the loom. Every one of them could read this cloth like a book.', scrollId: 'language-of-kente' },
    { id: 's3', image: img('oba-tusks'), caption: 'Royal regalia carries the same patterns — authority, written in thread.', scrollId: 'language-of-kente' },
  ] },
  { id: 'st-kamau', userId: 'kamau', createdAt: ago(6), expiresAt: ago(6) + 24 * H, items: [
    { id: 's4', image: img('maasai-ceremony'), caption: 'Eunoto week. The village is full.', scrollId: 'maasai-ceremony' },
  ] },
  { id: 'st-adaeze', userId: 'adaeze', createdAt: ago(7), expiresAt: ago(7) + 24 * H, items: [
    { id: 's5', image: img('ofe-onugbu'), caption: 'Nne’s pot, Sunday afternoon.', scrollId: 'ofe-onugbu' },
    { id: 's6', image: img('dish-west'), caption: 'With fufu, the only correct way.' },
  ] },
  { id: 'st-zola', userId: 'zola', createdAt: ago(9), expiresAt: ago(9) + 24 * H, items: [
    { id: 's7', image: img('zulu-dance'), caption: 'Rehearsals for Umkhosi.' },
    { id: 's7b', image: img('beaded-bride'), caption: 'My cousin’s beadwork for the big day.' },
    { id: 's7c', image: img('sisters'), caption: 'Sisters, before the procession.' },
    { id: 's7d', image: img('warriors-film'), caption: 'The amabutho arrive.', scrollId: 'zulu-reed' },
  ] },
  { id: 'st-nana', userId: 'nana', createdAt: ago(11), expiresAt: ago(11) + 24 * H, items: [
    { id: 's8', image: img('adinkra'), caption: 'This week: Gye Nyame.', scrollId: 'adinkra-meaning' },
    { id: 's8b', image: img('kente-weaving'), caption: 'Stamping cloth in Ntonso tomorrow.' },
  ] },
  { id: 'st-yuki', userId: 'yuki', createdAt: ago(13), expiresAt: ago(13) + 24 * H, items: [
    { id: 's9', image: img('emir-durbar'), caption: 'Kano, Sallah morning.' },
    { id: 's9b', image: img('chief-on-horse'), caption: 'The riders line up.', scrollId: 'durbar' },
    { id: 's9c', image: img('green-fans'), caption: 'Fans out for the Emir.' },
    { id: 's9d', image: img('mud-huts'), caption: 'Old city walls.' },
    { id: 's9e', image: img('bronze-artifacts'), caption: 'Palace museum, after the parade.' },
    { id: 's9f', image: img('sepia-portrait'), caption: 'My grandmother at the 1962 Durbar.' },
  ] },
]

/* ─────────── Communities ─────────── */
export const COMMUNITIES: Community[] = [
  { id: 'akan-circle', name: 'Akan Heritage Circle', image: img('p-c1'), cover: img('aso-oke-women'), category: 'Culture', members: 5241, privacy: 'public', about: 'A community dedicated to preserving and celebrating Akan cultural heritage. We share Scrolls, oral histories, traditions, and art from the Akan people of West Africa.', rules: ['Respect all cultural content and members.', 'Share only authentic cultural content.', 'No harmful stereotypes or misrepresentation.', 'Credit original sources.', 'Historian notes take precedence in disputes.'], adminIds: ['amara-diallo', 'yuki', 'kofi'], memberIds: ['kwame', 'kofi', 'fatima', 'nana', 'amaradia'], media: ['sepia-portrait', 'beaded-bride', 'green-fans', 'emir-durbar', 'aso-oke-women', 'oba-tusks', 'egungun-village', 'chief-on-horse', 'sisters', 'kongo-painting', 'swahili-festival', 'bronze-artifacts'].map(img) },
  { id: 'first-sons', name: 'First Sons', image: img('amazigh-brides'), cover: img('yoruba-drummers'), category: 'Family', members: 12400, privacy: 'public', about: 'For first sons across Africa and the diaspora — the weight, the honour and the jokes.', rules: ['Respect one another.', 'No mocking of family structures.'], adminIds: ['tunde'], memberIds: ['tunde', 'kwame'], media: ['yoruba-drummers', 'emir-durbar'].map(img) },
  { id: 'daughters-nile', name: 'Daughters of the Nile', image: img('beaded-bride'), cover: img('amazigh-brides'), category: 'Heritage', members: 8700, privacy: 'public', about: 'Women of the Nile valley sharing heritage from Egypt, Sudan, Ethiopia and beyond.', rules: ['Women-led space.', 'Credit original sources.'], adminIds: ['fatima'], memberIds: ['fatima'], media: ['amazigh-brides', 'beaded-bride'].map(img) },
  { id: 'yoruba-scholars', name: 'Yoruba Scholars', image: img('yoruba-drummers'), cover: img('egungun-village'), category: 'History', members: 5200, privacy: 'private', about: 'Researchers and elders documenting Yoruba language, Ifá and oral literature.', rules: ['Cite your sources.', 'Elders’ accounts are primary sources.'], adminIds: ['amara-okafor'], memberIds: ['amara-okafor', 'sade', 'danilo'], media: ['egungun-village', 'yoruba-drummers'].map(img) },
  { id: 'pan-african-historians', name: 'Pan-African Historians', image: img('p-c3'), cover: img('great-zimbabwe'), category: 'History', members: 9817, privacy: 'public', about: 'Historians across the continent comparing notes, debating sources and mentoring new Historians.', rules: ['Evidence first.', 'Disagree with the argument, not the person.'], adminIds: ['tariro', 'kofi'], memberIds: ['tariro', 'kofi'], media: ['great-zimbabwe', 'bronze-artifacts'].map(img) },
  { id: 'zulu-kingdom', name: 'Zulu Kingdom Stories', image: img('p-c4'), cover: img('zulu-dance'), category: 'Heritage', members: 2105, privacy: 'public', about: 'Umlando — the history of the Zulu kingdom, told by its people.', rules: ['Respect the royal house.', 'No appropriation of sacred practice.'], adminIds: ['zola'], memberIds: ['zola'], media: ['zulu-dance', 'beaded-bride'].map(img) },
  { id: 'east-african-voices', name: 'East African Voices', image: img('p-c2'), cover: img('maasai-ceremony'), category: 'Culture', members: 6432, privacy: 'public', about: 'Swahili coast to the Rift Valley — stories from East Africa.', rules: ['Respect all cultures.', 'Swahili and English welcome.'], adminIds: ['kamau'], memberIds: ['kamau'], media: ['maasai-ceremony', 'swahili-festival'].map(img) },
]

/* ─────────── Discovery ─────────── */
export const TOPICS: Topic[] = [
  { id: 'yoruba-heritage', name: 'Yoruba Heritage', image: img('yoruba-drummers'), region: 'West Africa', posts: 121, scrolls: 32 },
  { id: 'akan-festivals', name: 'Akan Festivals', image: img('akan-festival'), region: 'West Africa', posts: 284, scrolls: 76 },
  { id: 'zulu-traditions', name: 'Zulu Traditions', image: img('zulu-dance'), region: 'Southern Africa', posts: 166, scrolls: 41 },
  { id: 'amazigh-culture', name: 'Amazigh Culture', image: img('amazigh-brides'), region: 'North Africa', posts: 92, scrolls: 18 },
  { id: 'kongo-history', name: 'Kongo History', image: img('kongo-painting'), region: 'Central Africa', posts: 74, scrolls: 22 },
  { id: 'swahili-coast', name: 'Swahili Coast', image: img('swahili-festival'), region: 'East Africa', posts: 133, scrolls: 30 },
  { id: 'adinkra-symbols', name: 'Adinkra Symbols', image: img('adinkra'), region: 'Ghana · Akan', posts: 284, scrolls: 76 },
  { id: 'gele-headwrap', name: 'Gele Headwrap', image: img('aso-oke-women'), region: 'Nigeria · Yoruba', posts: 192, scrolls: 40 },
  { id: 'great-zimbabwe', name: 'Great Zimbabwe', image: img('great-zimbabwe'), region: 'Zimbabwe · Shona', posts: 140, scrolls: 35 },
  { id: 'maasai-beadwork', name: 'Maasai Beadwork', image: img('maasai-ceremony'), region: 'Kenya · Tanzania', posts: 156, scrolls: 29 },
]

export const TRENDING_CHIPS = ['For you', 'Durbar festival', 'Benue tribe', 'Biafra history', 'Historians', 'Communities']

/* Cultural taxonomy — straight from the functionality spec (search filters, Scroll categories) */
export const CATEGORIES = ['Culture & Tribes', 'Gods', 'Monarchs', 'Titles', 'Marriage', 'Festivals', 'Family Traditions', 'Belief', 'Age', 'Narration', 'Trade', 'Arts', 'Family', 'Adage', 'Food', 'Ornaments', 'Tattoos & Markings', 'Cultural Attire', 'Stories', 'Maps', 'Natural Resources', 'History', 'Music', 'Traditions']

export const DISCOVER_THEMES = [
  { name: 'Traditions', image: img('maasai-ceremony'), count: 1840 },
  { name: 'Food', image: img('ofe-onugbu'), count: 2210 },
  { name: 'Music', image: img('yoruba-drummers'), count: 3120 },
  { name: 'Arts', image: img('kente-weaving'), count: 1930 },
  { name: 'Stories', image: img('elders-art'), count: 2780 },
  { name: 'Festivals', image: img('akan-festival'), count: 1404 },
  { name: 'Monarchs', image: img('oba-tusks'), count: 640 },
  { name: 'Cultural Attire', image: img('aso-oke-women'), count: 1120 },
]

export const COUNTRIES: { name: string; flag: string; image: string; tribes: string[]; states: string[] }[] = [
  { name: 'Nigeria', flag: '🇳🇬', image: img('emir-durbar'), tribes: ['Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Edo', 'Ijaw', 'Tiv', 'Ibibio', 'Kanuri', 'Nupe'], states: ['Lagos', 'Oyo', 'Anambra', 'Kano', 'Edo', 'Enugu', 'Ogun', 'Kwara', 'Rivers', 'Benue'] },
  { name: 'Ghana', flag: '🇬🇭', image: img('akan-festival'), tribes: ['Akan', 'Ewe', 'Ga-Adangbe', 'Mole-Dagbani', 'Guan'], states: ['Ashanti', 'Greater Accra', 'Volta', 'Northern', 'Central'] },
  { name: 'Kenya', flag: '🇰🇪', image: img('maasai-ceremony'), tribes: ['Maasai', 'Kikuyu', 'Luo', 'Luhya', 'Kalenjin', 'Kamba'], states: ['Nairobi', 'Kajiado', 'Kisumu', 'Mombasa', 'Nakuru'] },
  { name: 'South Africa', flag: '🇿🇦', image: img('zulu-dance'), tribes: ['Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Ndebele', 'Venda'], states: ['KwaZulu-Natal', 'Gauteng', 'Eastern Cape', 'Western Cape', 'Limpopo'] },
  { name: 'Zimbabwe', flag: '🇿🇼', image: img('great-zimbabwe'), tribes: ['Shona', 'Ndebele', 'Tonga', 'Venda'], states: ['Harare', 'Masvingo', 'Bulawayo', 'Manicaland'] },
  { name: 'Morocco', flag: '🇲🇦', image: img('amazigh-brides'), tribes: ['Amazigh', 'Arab', 'Sahrawi'], states: ['Souss-Massa', 'Marrakesh-Safi', 'Fès-Meknès', 'Rabat-Salé'] },
  { name: 'Ethiopia', flag: '🇪🇹', image: img('sepia-portrait'), tribes: ['Amhara', 'Oromo', 'Tigray', 'Somali', 'Sidama'], states: ['Addis Ababa', 'Amhara', 'Oromia', 'Tigray'] },
  { name: 'Senegal', flag: '🇸🇳', image: img('sisters'), tribes: ['Wolof', 'Serer', 'Fula', 'Mandinka', 'Jola'], states: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'] },
  { name: 'Tanzania', flag: '🇹🇿', image: img('swahili-festival'), tribes: ['Sukuma', 'Chaga', 'Maasai', 'Swahili', 'Haya'], states: ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Mwanza'] },
  { name: 'Sudan', flag: '🇸🇩', image: img('beaded-bride'), tribes: ['Nubian', 'Beja', 'Fur', 'Arab'], states: ['Khartoum', 'Northern', 'Kassala', 'Darfur'] },
]

/* ─────────── Onboarding (from mobile Figma) ─────────── */
export const INTERESTS = [
  { name: 'Music', emoji: '🎵' }, { name: 'Dance', emoji: '💃' }, { name: 'Visual Arts', emoji: '🎨' },
  { name: 'Film', emoji: '🎬' }, { name: 'Literature', emoji: '📚' }, { name: 'Food', emoji: '🍲' },
  { name: 'Fashion', emoji: '👗' }, { name: 'Crafts', emoji: '🏺' }, { name: 'Architecture', emoji: '🏛️' },
  { name: 'Festivals', emoji: '🎉' }, { name: 'Folklore', emoji: '🌙' }, { name: 'Language', emoji: '🗣️' },
  { name: 'Photography', emoji: '📷' }, { name: 'Theater', emoji: '🎭' }, { name: 'Heritage', emoji: '🏰' },
  { name: 'Spirituality', emoji: '🕯️' }, { name: 'History', emoji: '📜' }, { name: 'Sports', emoji: '⚽' },
  { name: 'Travel', emoji: '🧭' }, { name: 'Lifestyle', emoji: '🌿' },
]

export const CULTURES = [
  { name: 'Yoruba', region: 'West Africa' }, { name: 'Igbo', region: 'West Africa' }, { name: 'Akan', region: 'West Africa' }, { name: 'Ashanti', region: 'West Africa' },
  { name: 'Hausa', region: 'West Africa' }, { name: 'Wolof', region: 'West Africa' }, { name: 'Fula', region: 'West Africa' }, { name: 'Mandinka', region: 'West Africa' },
  { name: 'Edo', region: 'West Africa' }, { name: 'Ewe', region: 'West Africa' },
  { name: 'Zulu', region: 'Southern Africa' }, { name: 'Shona', region: 'Southern Africa' }, { name: 'Ndebele', region: 'Southern Africa' }, { name: 'Xhosa', region: 'Southern Africa' },
  { name: 'Amhara', region: 'East Africa' }, { name: 'Maasai', region: 'East Africa' }, { name: 'Somali', region: 'East Africa' }, { name: 'Luo', region: 'East Africa' },
  { name: 'Baganda', region: 'East Africa' }, { name: 'Swahili Coast', region: 'East Africa' },
  { name: 'Amazigh', region: 'North Africa' }, { name: 'Tuareg', region: 'North Africa' }, { name: 'Nubian', region: 'North Africa' },
  { name: 'Kongo', region: 'Central Africa' }, { name: 'Luba', region: 'Central Africa' },
]
export const REGIONS = ['All', 'West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Central Africa']

export const GENRES = [
  { name: 'Afrobeats', emoji: '🎸' }, { name: 'Highlife', emoji: '🎺' }, { name: 'Amapiano', emoji: '🎹' }, { name: 'Afro-jazz', emoji: '🎷' },
  { name: 'Soukous', emoji: '🎸' }, { name: 'Mbalax', emoji: '🥁' }, { name: 'Gnawa', emoji: '🎶' }, { name: 'Bongo Flava', emoji: '🎤' },
  { name: 'Gospel', emoji: '🙏' }, { name: 'Traditional Percussion', emoji: '🪘' }, { name: 'Contemporary Alt.', emoji: '🎙️' }, { name: 'African Classical', emoji: '🎻' },
]

export const CUISINES = [
  { name: 'West African', image: img('dish-west') }, { name: 'East African', image: img('dish-east') },
  { name: 'North African', image: img('dish-north') }, { name: 'Central African', image: img('dish-central') },
  { name: 'Southern African', image: img('dish-southern') }, { name: 'Island Cuisines', image: img('dish-island') },
  { name: 'Street Food', image: img('dish-street') },
]
export const FOOD_STORIES = ['Traditional Recipes', 'Food History', 'Ceremonial Dishes', 'Cooking Techniques']

/* ─────────── Comments ─────────── */
export const COMMENTS: Comment[] = [
  { id: 'c1', targetId: 'language-of-kente', authorId: 'kofi', text: 'Historian’s note: the “Adwinasa” pattern shown in the second frame was historically reserved for the Asantehene. Beautifully documented.', createdAt: ago(1.5), likes: 214 },
  { id: 'c2', targetId: 'language-of-kente', authorId: 'kwame', text: 'My grandfather wove in Bonwire. Seeing this made me call him today.', createdAt: ago(1.2), likes: 88 },
  { id: 'c3', targetId: 'language-of-kente', authorId: 'nana', text: 'Will you do one on Adinkra stamping next? The two are cousins.', createdAt: ago(0.8), likes: 41 },
  { id: 'c3r', targetId: 'language-of-kente', authorId: 'amaradia', text: 'Yes! Already filming in Ntonso next month.', createdAt: ago(0.6), likes: 30, parentId: 'c3' },
  { id: 'c4', targetId: 'ofe-onugbu', authorId: 'sade', text: 'The way she washes the leaves — my mother does exactly this.', createdAt: ago(3), likes: 52 },
  { id: 'c5', targetId: 'great-zimbabwe', authorId: 'kofi', text: 'Archaeological consensus is clear on this. Glad to see it told by a Shona historian.', createdAt: ago(30), likes: 401 },
  { id: 'c6', targetId: 'great-zimbabwe', authorId: 'fatima', text: 'I think the Dark Zone discussion here is healthy — the history of denial is itself history.', createdAt: ago(28), likes: 120 },
  { id: 'c7', targetId: 'p1', authorId: 'nana', text: 'Sharing this with my students.', createdAt: ago(1), likes: 12 },
]

/* ─────────── Messages ─────────── */
export const CONVERSATIONS: Conversation[] = [
  { id: 'cv-kofi', participantId: 'kofi', unread: 2, pinnedScrollId: 'language-of-kente', messages: [
    { id: 'm1', from: 'kofi', text: 'Akwaaba! I saw you joined the Akan Heritage Circle.', at: ago(26) },
    { id: 'm2', from: 'me', text: 'Thank you Doctor — I’ve been reading your notes on Adinkra.', at: ago(25) },
    { id: 'm3', from: 'kofi', text: 'You must watch this one. Pinning it for you.', at: ago(3), scrollId: 'language-of-kente' },
    { id: 'm4', from: 'kofi', text: 'Tell me what you think of the second frame.', at: ago(2.9) },
  ] },
  { id: 'cv-adaeze', participantId: 'adaeze', unread: 0, messages: [
    { id: 'm5', from: 'adaeze', text: 'Here is the recipe card my grandmother wrote.', at: ago(30), attachment: { kind: 'document', name: 'Nne-ofe-onugbu.pdf' } },
    { id: 'm6', from: 'me', text: 'This is a treasure. Thank you!', at: ago(29) },
  ] },
  { id: 'cv-kamau', participantId: 'kamau', unread: 1, messages: [
    { id: 'm7', from: 'kamau', text: 'Photos from Eunoto are up 📸', at: ago(5), attachment: { kind: 'image', name: 'eunoto.jpg', src: img('maasai-ceremony') } },
  ] },
  { id: 'cv-akan', communityId: 'akan-circle', unread: 0, messages: [
    { id: 'm8', from: 'amara-diallo', text: 'Welcome to all our new members this week!', at: ago(40) },
    { id: 'm9', from: 'kwame', text: 'Medaase! Excited to be here.', at: ago(39) },
  ] },
  { id: 'cv-zola', participantId: 'zola', unread: 0, messages: [
    { id: 'm10', from: 'me', text: 'Loved your Reed Dance Scroll.', at: ago(60) },
    { id: 'm11', from: 'zola', text: 'Ngiyabonga! More coming in September.', at: ago(58) },
  ] },
]

/* ─────────── Notifications ─────────── */
export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'scroll', actorId: 'amaradia', text: 'uploaded a new Scroll: “The Language of Kente”', at: ago(2), link: '/scroll/language-of-kente', read: false, image: img('aso-oke-women') },
  { id: 'n2', type: 'raider', actorId: 'kwame', text: 'started raiding you', at: ago(3), link: '/u/kwame', read: false },
  { id: 'n3', type: 'comment', actorId: 'nana', text: 'commented on a Scroll you saved: “Will you do one on Adinkra stamping next?”', at: ago(5), link: '/scroll/language-of-kente', read: false },
  { id: 'n4', type: 'message', actorId: 'kofi', text: 'pinned a Must Watch Reel in your messages', at: ago(3), link: '/messages/cv-kofi', read: true },
  { id: 'n5', type: 'community', actorId: 'amara-diallo', text: 'posted an announcement in Akan Heritage Circle', at: ago(8), link: '/communities/akan-circle', read: true },
  { id: 'n6', type: 'scroll', actorId: 'tariro', text: 'uploaded a new Scroll: “Great Zimbabwe Was Built By Us”', at: ago(40), link: '/scroll/great-zimbabwe', read: true, image: img('great-zimbabwe') },
  { id: 'n7', type: 'verification', text: 'Verify your African identity to get the verified mark on your profile and Scrolls.', at: ago(48), link: '/verification', read: true },
]

export const STATUS_FRIENDS = ['amaradia', 'kamau', 'adaeze', 'zola', 'nana', 'yuki']

export const PLANS = [
  { id: 'executive', name: 'Executive', price: '₦15,000', blurb: 'For institutions and serious documentarians.' },
  { id: 'premium', name: 'Premium', price: '₦7,500', blurb: 'For creators publishing Scrolls regularly.' },
  { id: 'standard', name: 'Standard', price: '₦3,000', blurb: 'For storytellers getting started.' },
  { id: 'subpar', name: 'Subpar', price: 'Free', blurb: 'Discover, raid and share.' },
] as const

export const PLAN_MATRIX: { feature: string; values: [string, string, string, string]; note?: string }[] = [
  { feature: 'Profile Tune', values: ['✓', '✓', '✓', '✓'] },
  { feature: 'Scroll media', values: ['Confirm', 'Confirm', 'Confirm', 'Confirm'], note: 'Media limits in the source document overlap between plans — awaiting the product team’s exact rules.' },
  { feature: 'Documentary Scrolls', values: ['✓', '✓', '✓', '—'] },
  { feature: 'Anonymous (Rogue Raider)', values: ['✓', '✓', '—', '—'] },
  { feature: 'Voice recording', values: ['✓', '✓', '✓', '✓'] },
]
