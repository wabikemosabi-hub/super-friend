export type Stars = 1 | 2 | 3 | 4 | 5;

export type Encounter = { title: string; story: string };

export const encounters: Record<Stars, Encounter[]> = {
  1: [
    {
      title: 'Mutant Latrine Found',
      story: `{date}
{navigator} pointed me towards a stop in the wasteland known as {title}. Instead of the {promised1} that I was promised I found {found1}! The smell was horrendous, but the icing on the cake was that I was snooping around when a horrible sound came to my ears. I thought at first it was {promised2} but instead it was {found2} and the sound was due to a constipated mutant. I was able to take him out, but his last words will haunt me: You'll never find {promised3} here, there is only {found3}. His death gas lingered long after he had shed his mortal coil.`,
    },
    {
      title: 'Found a Twinkie, but it was actually an IED',
      story: `{date}
{navigator} may have actually been trying to kill me with {title}! I showed up hoping for {promised1} but found only {found1}! As I was getting ready to leave, I thought I saw {promised2} but it was a Twinkie with an explosive device in it that felt far more like {found2}. I was able to disarm the device, but my glee at seeing {promised3} was short-lived as it was actually {found3}.`,
    },
    {
      title: 'Enslaved by a Cult',
      story: `{date}
I was tooling around what used to be called the Bible Belt before the Great Media Collapse of 2012. {navigator} told me about a great place to meet other nomads, but when I got there, it was the home of the Birds of a Feather Cult. You know the one where all the members wear feathers and say that they believe in {promised1} and {promised2}, but instead they actually just poop on statues and believe in {found1} and {found2}! I was forced to feed their leader like a baby bird before being promised {promised3} but instead I was forced to be a part of {found3}. I only escaped because I chewed up the last of my Xanax and spit it in his mouth. WOULD NOT RECOMMEND!`,
    },
  ],
  2: [
    {
      title: 'Community Garden Found',
      story: `{date}
{navigator} told me about a little community garden that other nomads were using. When I got there expecting {promised1}, I was told by The Gardeners that I would first have to acknowledge {found1}. I was able to do some bartering, trading away {promised2} for an equally bad {found2}. The real issue around {promised3} though, is that there were only {found3} and beets. If I wanted dirt, I'd eat dirt!`,
    },
    {
      title: 'Battle of the Bands',
      story: `{date}
{navigator} told me about a local Battle of the Bands that was in my local area. They told me that {promised1} would be a reason to be there, but they didn't warn me about {found1}. Unfortunately there were no musical instruments as this was a battle between local bandits. I waited in the wings while the slaughter commenced, and I almost got my hands on a {promised2} but some guy with a grabber hand got it first and left me with only {found2}. This is a bad area! People will promise you {promised3} but you'll find only {found3}.`,
    },
    {
      title: 'Commune invite extended to me',
      story: `{date}
{navigator} told me about a place that was looking for more people like me to fill their ranks. When I got there expecting {promised1} and {promised2}, I found that there was only {found1} and {found2}. The "commune" was actually just another Mutant Compound, where one of the leader's heads promised {promised3} but the other head was only giving out {found3} instead. They did have a decent guac, though.`,
    },
  ],
  3: [
    {
      title: 'Found a truck filled with protein',
      story: `{date}
{navigator} and the crew of a local mobile pub said that they had heard that there was a place nearby with {promised1}. When I got there, I found that {found1} was there, and completely acceptable. The protein was a good mix of {found2} and {promised2}, but it was really just Spam. I don't hate Spam, but I don't love it either. I was hoping for more of {promised3} but I'll take {found3} any day of the week instead.`,
    },
    {
      title: 'Found an area with adequate supplies',
      story: `{date}
{navigator} tipped me off to this place they promised was a paradise! I found it to be adequate, but nothing to write home about. While they said that the ruins in the area contained {promised1} and {promised2}, I found that it was closer to {found1} and {found2}. Sometimes you shoot for {promised3} but get only {found3}.`,
    },
    {
      title: 'Found a new album!',
      story: `{date}
{navigator} alerted me to a place that still had some albums for sale. In my recent forays into the ruins of Old New Hampshire, or {title} as it is known colloquially, I found a copy of Rumours by Fleetwood Mac. I was so excited that I ran back to the convoy and told everybody about {promised1} and {promised2}. Everybody gathered around, and I put the record on the player, only to realize that instead of Fleetwood Mac, we were listening to a Polka Cover Band that focused on {found1} and {found2} in their performances. I find it to still be strangely calming, and while I didn't get {promised3} I will always have {found3}.`,
    },
    {
      title: 'Had a day',
      story: `{date}
There are days that make a nomad wonder why they wander. Days that make nomads praise whatever higher power they deem worthy of such praise for the oasis they find along the way. But most days are days that are just neutral. {title} stop is just this: a stop that is a stop. You won't find {promised1} here, but just another {found1}. A glimpse of {promised2} is nothing more than the everyday {found2}. But in the end, you'll never see {found3} come close to being {promised3}. It will blur into all those others that have come upon this wasteland of ours, neither particularly good nor particularly bad.`,
    },
  ],
  4: [
    {
      title: "Found a hot spring that hasn't been used by cannibals to make soup!",
      story: `{date}
This stop was amazing! When {navigator} said that {title} was a must-see stop for {promised1}, I'd only add that {found1} was there, too! This hot spring hotspot is filled to the brim with {promised2} and {found2}, with none of the usual femurs or skull fragments found at other such natural locations. {navigator} will tell you that {promised3} is the main reason for visiting {title}, but they have again buried the lede of {found3}! Would highly recommend!`,
    },
    {
      title: 'Found a music player filled with music!',
      story: `{date}
I can't believe it! I found a fully functioning music player filled with music at stop {title}! It has a charger, and the music has everything from {promised1} to {found1}! I've played most of the music for {navigator}, and while they loved {promised2}, I was more excited about {found2}. But it doesn't matter if you like {promised3} or {found3}, because this player has it all. The only negative is that it's a Zune.`,
    },
    {
      title: 'Found a crate of toothpaste',
      story: `{date}
What a day, what a day! When {navigator} told me about {title}, I was already excited! I can't even tell you how amazing it is! I found a whole crate of toothpaste! It's covered with stickers that say things like, "Now contains more {promised1} and {found1}!" and "9 out of 10 dentists agree that Flurp is {promised2} and prone to help with {found2}." I am just so excited to have something worth {found3}! When {navigator} said {promised3}, they weren't kidding!`,
    },
  ],
  5: [
    {
      title: 'Found a fully stocked Winnebago with amenities',
      story: `{date}
Oh, glorious day! {navigator} told me about {title} a while back, and I thought they must have been exaggerating, but I was so pleasantly surprised. When they said that the stop had {promised1}, they were right! It also has {found1} as well! A fully stocked bar, with a grow lab for weed! I'm beyond {promised2} and well into {found2} territory! But the thing that I was most excited about, {promised3}, doesn't even come close to {found3}! IT HAS A BIDET! I haven't spent time looking for "magazines or soft leaves" in ages now! Thanks, {navigator}!`,
    },
    {
      title: 'Porn stash found!',
      story: `{date}
{navigator} told me about a little place they like to call {title}! I stopped by and while at first glance it just looked like a normal hangout for teens before the collapse, but when I rolled over the moldy mattress with piss stains, I found it! A porn stash that I can use to set myself up as a porn czar in this wasteland! The stash is perfect because it has a ton of {promised1} and {found1}. The amount of watersports is very small! Which leaves way more room for {promised2} and {found2} in the catalogue. So if you are into {promised3} or {found3}, come on down to Porn Czar's Crazy Empire today!`,
    },
    {
      title: 'New business idea fully realized!',
      story: `{date}
{navigator} told me that the mutants at {title} were up for ANYTHING, and boy were they not kidding. I was able to open a new LAST MUTANT STANDING fight club, where {promised1} and {found1} are just the beginning! Come see a mutant with {promised2} fight a mutated pig with {found2} for only 18 Kohl$ Ka$h! Come for the {found3} but stay for the {promised3}! Kids 8 and under are free with a legal guardian or slaver. Winner gets to keep the organs!`,
    },
  ],
};
