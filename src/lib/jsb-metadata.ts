/**
 * Jazz Standard Bible (黒本) metadata
 * Maps song titles to JSB1/JSB2 page numbers
 * 
 * JSB1: ジャズ・スタンダード・バイブル (227曲, リットーミュージック)
 * JSB2: ジャズ・スタンダード・バイブル2 改訂版 (227曲, リットーミュージック)
 */

export interface JSBInfo {
  book: 1 | 2;
  page: number;
}

// Title normalization for matching
function normalize(title: string): string {
  return title.toLowerCase()
    .replace(/\([^)]*\)/g, '') // remove anything in parens
    .replace(/["'`]/g, '')     // remove quotes/apostrophes entirely
    .replace(/[.,\-?!:;]/g, ' ')    // replace punctuation with spaces
    .replace(/\s+(a|the)\s*$/i, '') // remove trailing ", a" or ", the"
    .replace(/^(a|the)\s+/i, '') // remove leading "a " or "the "
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
}

// Raw mappings from book index
const JSB1_RAW_MAP: Record<string, number> = {
  "afternoon in paris": 1, "airegin": 2, "alice in wonderland": 3, "all blues": 4, "all of me": 5,
  "all of you": 6, "all the things you are": 7, "alone together": 8, "anthropology": 9, "april in paris": 10,
  "au privave": 11, "autumn in new york": 12, "autumn leaves": 13, "bag's groove": 14, "beatrice": 15,
  "beautiful love": 16, "bessie's blues": 17, "billie's bounce": 18, "black nile": 19, "black orpheus": 20,
  "blue bossa": 21, "blue in green": 22, "blue monk": 23, "bluesette": 24, "body and soul": 25,
  "bolivia": 26, "but not for me": 27, "bye bye blackbird": 28, "c jam blues": 29, "candy": 30,
  "cantaloupe island": 31, "caravan": 32, "cherokee": 33, "cheryl": 34, "the chicken": 35,
  "a child is born": 36, "the christmas song": 37, "cleopatra's dream": 38, "come rain or come shine": 39,
  "con alma": 40, "confirmation": 41, "corcovado": 42, "cute": 43, "daahoud": 44, "day by day": 45,
  "the days of wine and roses": 46, "dear old stockholm": 47, "dolphin dance": 48, "donna lee": 49,
  "doxy": 50, "easy living": 51, "emily": 52, "everything happens to me": 53, "evidence": 54,
  "falling in love with love": 55, "feel like makin' love": 56, "fly me to the moon": 57, "a foggy day": 58,
  "footprints": 59, "forest flower": 60, "four": 61, "four on six": 62, "freddie the freeloader": 63,
  "georgia on my mind": 64, "giant steps": 65, "girl from ipanema": 66, "good bait": 67, "groovin' high": 68,
  "have you met miss jones?": 69, "here's that rainy day": 70, "hot house": 71, "how deep is the ocean": 72,
  "how high the moon": 73, "how insensitive": 74, "i can't get started": 75, "i can't give you anything but love": 76,
  "i concentrate on you": 77, "i could write a book": 78, "i didn't know what time it was": 79,
  "i fall in love too easily": 80, "i hear a rhapsody": 81, "i love you": 82, "i mean you": 83,
  "i remember clifford": 84, "i remember you": 85, "i should care": 86, "i thought about you": 87,
  "i'll close my eyes": 88, "i'll remember april": 89, "i'm old fashioned": 90, "if i should lose you": 91,
  "if i were a bell": 92, "if you could see me now": 93, "impressions": 94, "in a mellow tone": 95,
  "in a sentimental mood": 96, "in your own sweet way": 97, "inner urge": 98, "interplay": 99,
  "invitation": 100, "israel": 101, "it could happen to you": 102, "it don't mean a thing": 103,
  "it might as well be spring": 104, "it's all right with me": 105, "it's only a paper moon": 106,
  "it's you or no one": 107, "jor du": 108, "joy spring": 109, "just friends": 110,
  "just one of those things": 111, "killer joe": 112, "lady bird": 113, "lament": 114, "lazy bird": 115,
  "left alone": 116, "like someone in love": 117, "little b's poem": 118, "l-o-v-e": 119, "love for sale": 120,
  "love is here to stay": 121, "love letters": 122, "lover come back to me": 123, "lover man": 124,
  "lullaby of birdland": 125, "mack the knife": 126, "mac the knife": 126, "moritat": 126, "maiden voyage": 127,
  "milestones": 128, "moanin'": 129, "moment's notice": 130, "mr. p.c.": 131, "my favorite things": 132,
  "my foolish heart": 133, "my funny valentine": 134, "my little suede shoes": 135,
  "my one and only love": 136, "my romance": 137, "naima": 138, "nardis": 139, "nica's dream": 140,
  "night and day": 141, "the night has a thousand eyes": 142, "a night in tunisia": 143,
  "now's the time": 144, "old devil moon": 145, "old folks": 146, "oleo": 147, "on a clear day": 148,
  "on green dolphin street": 149, "on the sunny side of the street": 150, "once i loved": 151,
  "one note samba": 152, "ornithology": 153, "out of nowhere": 154, "over the rainbow": 155,
  "peace": 156, "pent-up house": 157, "pent up house": 157, "perdido": 158, "polka dots and moonbeams": 159,
  "prelude to a kiss": 160, "recado": 161, "recado bossa nova": 161, "recorda me": 162, "recordame": 162, "rhythm-a-ning": 163, "round midnight": 164,
  "samba de orfeu": 165, "satin doll": 166, "scrapple from the apple": 167, "secret love": 168,
  "seven steps to heaven": 169, "the shadow of your smile": 170, "shiny stockings": 171,
  "smoke gets in your eyes": 172, "so what": 173, "softly as in a morning sunrise": 174,
  "solar": 175, "some other blues": 176, "someday my prince will come": 177, "someone to watch over me": 178,
  "song for my father": 179, "song is you": 180, "sonnymoon for two": 181, "sophisticated lady": 182,
  "spain": 183, "spring can really hang you up the most": 184, "speak low": 185, "st. thomas": 186,
  "stable mates": 187, "stablemates": 187, "star eyes": 188, "stardust": 189, "stella by starlight": 190,
  "stolen moments": 191, "stompin' at the savoy": 192, "straight, no chaser": 193, "strollin'": 194,
  "summertime": 195, "take five": 196, "take the \"a\" train": 197, "tell me a bedtime story": 198,
  "tenor madness": 199, "there is no greater love": 200, "there will never be another you": 201,
  "up jumped spring": 202, "very early": 203, "walkin'": 204, "waltz for debby": 205,
  "watermelon man": 206, "wave": 207, "well you needn't": 208, "what a difference a day made": 209,
  "what are you doing the rest of your life?": 210, "what is this thing called love?": 211,
  "what's new": 212, "when i fall in love": 213, "when sunny gets blue": 214, "when you wish upon a star": 215,
  "whisper not": 216, "white christmas": 217, "woody'n you": 218, "work song": 219,
  "yardbird suite": 220, "yes or no": 221, "yesterdays": 222, "you and the night and the music": 223,
  "you don't know what love is": 224, "you must believe in spring": 225, "you stepped out of a dream": 226,
  "you'd be so nice to come home to": 227
};

const JSB2_RAW_MAP: Record<string, number> = {
  "actual proof": 1, "affirmation": 2, "afro blue": 3, "agua de beber": 4, "ain't misbehavin'": 5,
  "alfie": 6, "almost like being in love": 7, "along came betty": 8, "ana maria": 9, "angel eyes": 10,
  "armando's rhumba": 11, "as time goes by": 12, "ask me now": 13, "be-bop": 14, "bemsha swing": 15,
  "bernie's tune": 16, "besame mucho": 17, "bewitched": 18, "billy boy": 19, "black coffee": 20,
  "blame it on my youth": 21, "blue moon": 22, "blue train": 23, "blues for alice": 24, "bouncing with bud": 25,
  "bud powell": 26, "but beautiful": 27, "bye-ya": 28, "ceora": 29, "chasing the bird": 30,
  "cheek to cheek": 31, "chega de saudade": 32, "chelsea bridge": 33, "come sunday": 34, "cold duck time": 35,
  "cool struttin'": 36, "cotton tail": 37, "cry me a river": 38, "danny boy": 39, "darn that dream": 40,
  "dat dere": 41, "day dream": 42, "del sasser": 43, "desafinado": 44, "dexterity": 45, "dindi": 46,
  "don't get around much anymore": 47, "the duke": 48, "e.s.p": 49, "easy to love": 50, "eiderdown": 51,
  "eighty one": 52, "el gaucho": 53, "embraceable you": 54, "the end of a love affair": 55, "epistrophy": 56,
  "eronel": 57, "estate": 58, "ev'ry time we say goodbye": 59, "eye of the hurricane": 60,
  "fascinating rhythm": 61, "fee-fi-fo-fum": 62, "firm roots": 63, "first song": 64,
  "five hundred miles high": 65, "five spot after dark": 66, "for all we know": 67, "for once in my life": 68,
  "four brothers": 69, "freedom jazz dance": 70, "friday the 13th": 71, "the gentle rain": 72,
  "girl talk": 73, "god bless the child": 74, "golden earrings": 75, "gone with the wind": 76,
  "good morning heartache": 77, "got a match?": 78, "hackensack": 79, "half nelson": 80,
  "honeysuckle rose": 81, "humpty, dumpty": 82, "hush-a-bye": 83, "i got it bad": 84, "i got rhythm": 85,
  "i hear music": 86, "i left my heart in san francisco": 87, "i let a song go out of my heart": 88,
  "i loves you, porgy": 89, "i only have eyes for you": 90, "i want to talk about you": 91,
  "i will wait for you": 92, "i wish i kiew": 93, "i'm a fool to want you": 94, "i'm beginning to see the light": 95,
  "i'm gettin sentimental over you": 96, "i'm in the mood for love": 97, "i'm walkin'": 98,
  "i've got the world on a string": 99, "i've never been in love before": 100,
  "in the wee small hours of the morning": 101, "in walked bud": 102, "infant eyes": 103,
  "isn't it romantic?": 104, "isn't she lovely": 105, "it never entered my mind": 106,
  "it's easy to remember": 107, "just in time": 108, "just squeeze me": 109, "la fiesta": 110,
  "laura": 111, "litha": 112, "little sunflower": 113, "lush life": 114, "the look of love": 115,
  "mambo inn": 116, "the man i love": 117, "manteca": 118, "mas que nada": 119, "mean to me": 120,
  "meditation": 121, "memories of you": 122, "mercy, mercy, mercy": 123, "midnight mood": 124,
  "misterioso": 125, "misty": 126, "mona lisa": 127, "monk's dream": 128, "monk's mood": 129,
  "mood indigo": 130, "moon river": 131, "moonlight in vermont": 132, "moonlight serenade": 133,
  "moose the mooche": 134, "more than you know": 135, "my ideal": 136, "my shining hour": 137,
  "my ship": 138, "nancy": 139, "the nearness of you": 140, "nefertiti": 141, "never let me go": 142,
  "nice work if you can get it": 143, "a nightingale sang in berkeley square": 144, "nothing personal": 145,
  "o grande amor": 146, "off minor": 147, "on a misty night": 148, "on the street where you live": 149,
  "once in a while": 150, "one by one": 151, "one finger snap": 152, "our spanish love song": 153,
  "pannonica": 154, "the peacocks": 155, "peri's scope": 156, "pinocchio": 157, "poinciana": 158,
  "prince of darkness": 159, "quiet now": 160, "reflections": 161, "relaxin' at camarillo": 162,
  "road song": 163, "robin's nest": 164, "ruby my dear": 165, "s'wonderful": 166, "say it": 167,
  "sea journey": 168, "sentimental journey": 169, "september in the rain": 170, "the sidewinder": 171,
  "sister sadie": 172, "skylark": 173, "smile": 174, "so in love": 175, "so many stars": 176,
  "solitude": 177, "somebody loves me": 178, "soul eyes": 179, "soul trane": 180, "speak no evil": 181,
  "spring is here": 182, "sugar": 183, "the summer knows": 184, "summer night": 185, "sunny": 186,
  "tadd's delight": 187, "taking a chance on love": 188, "tangerine": 189, "tea for two": 190,
  "teach me tonight": 191, "tee bag": 192, "teen town": 193, "tenderly": 194, "that's all": 195,
  "they can't take that away from me": 196, "they say it's wonderful": 197,
  "things ain't what they used to be": 198, "think of one": 199, "this masquerade": 200,
  "three views of a secret": 201, "a time for love": 202, "time remembered": 203, "triste": 204,
  "tune up": 205, "turn out the stars": 206, "two bass hit": 207, "two for the road": 208,
  "unit 7": 209, "upper manhattan medical group": 210, "the very thought of you": 211,
  "waltz for ruth": 212, "watch what happens": 213, "the way you look tonight": 214,
  "we'll be together again": 215, "a weaver of dreams": 216, "what a wonderful world": 217,
  "when lights are low": 218, "where or when": 219, "who can i turn to": 220, "will you still be mine": 221,
  "windows": 222, "with a song in my heart": 223, "without a song": 224, "you're my everything": 225,
  "you are the sunshine of my life": 226, "you are too beautiful": 227
};

// Programmatically normalize map keys for robust matching
const JSB1_MAP = Object.fromEntries(
  Object.entries(JSB1_RAW_MAP).map(([k, v]) => [normalize(k), v])
);

const JSB2_MAP = Object.fromEntries(
  Object.entries(JSB2_RAW_MAP).map(([k, v]) => [normalize(k), v])
);

export function getJSBInfo(title: string): JSBInfo | null {
  const key = normalize(title);
  
  if (JSB1_MAP[key]) {
    return { book: 1, page: JSB1_MAP[key] };
  }
  if (JSB2_MAP[key]) {
    return { book: 2, page: JSB2_MAP[key] };
  }
  return null;
}

export function formatJSBLabel(info: JSBInfo | null): string {
  if (!info) return '';
  return `黒本${info.book} p.${info.page}`;
}
