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
In my recent forays into the ruins of Old New Hampshire, I found a copy of Rumours by Fleetwood Mac. I was so excited that I ran back to the convoy and told everybody about {promised1} and {promised2}. Everybody gathered around, and I put the record on the player, only to realize that instead of Fleetwood Mac, we were listening to a Polka Cover Band that focused on {found1} and {found2} in their performances. I find it to still be strangely calming, and while I didn't get {promised3} I will always have {found3}.`,
    },
  ],
  4: [
    {
      title: 'PLACEHOLDER 4 STAR ENCOUNTER',
      story: `{date}
PLACEHOLDER. {navigator} promised {promised1}, {promised2} and {promised3}. I found {found1}, {found2} and {found3}.`,
    },
  ],
  5: [
    {
      title: 'PLACEHOLDER 5 STAR ENCOUNTER',
      story: `{date}
PLACEHOLDER. {navigator} promised {promised1}, {promised2} and {promised3}. I found {found1}, {found2} and {found3}.`,
    },
  ],
};
