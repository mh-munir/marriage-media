/**
 * AI Conversation Starter generator for Marriage Media.
 * Generates personalized conversation openers based on both profiles.
 */

interface UserProfile {
  firstName: string;
  gender: string;
  age: number;
  profession: string;
  highestEducation: string;
  religion: string;
  hobbies: string[];
  familyValues: string;
  diet: string;
  country: string;
  division?: string;
  photos: { url: string; isPrimary: boolean }[];
}

interface MatchProfile extends UserProfile {
  firstName: string;
}

/**
 * Generate conversation starters based on both profiles' shared interests.
 */
export function generateConversationStarters(
  user: UserProfile,
  match: MatchProfile
): string[] {
  const starters: string[] = [];

  // Shared hobbies
  const commonHobbies = user.hobbies.filter(h =>
    match.hobbies.some(mh => mh.toLowerCase() === h.toLowerCase())
  );
  if (commonHobbies.length > 0) {
    starters.push(
      `Hi ${match.firstName}! I noticed we both enjoy ${commonHobbies[0].toLowerCase()}. What got you started with that?`,
      `Hey ${match.firstName}! I see we share a love for ${commonHobbies[0].toLowerCase()}. Have you been doing it long?`
    );
  }

  // Same location
  if (user.division && user.division === match.division) {
    starters.push(
      `Hello ${match.firstName}! It's great to find someone from ${user.division}! What do you love most about living there?`,
      `Hi ${match.firstName}! Fellow ${user.division} resident here! Have you lived there your whole life?`
    );
  }

  // Same profession area
  if (user.profession === match.profession) {
    starters.push(
      `Hi ${match.firstName}! A fellow ${match.profession.toLowerCase()}! How are you enjoying your work?`,
      `Hey ${match.firstName}! It's interesting to meet someone in the same profession. What's the most rewarding part of your work?`
    );
  }

  // Education connection
  if (user.highestEducation === match.highestEducation) {
    starters.push(
      `Hello ${match.firstName}! I see you also have a ${match.highestEducation.toLowerCase()}! Where did you study?`,
    );
  }

  // Religion connection
  if (user.religion === match.religion) {
    starters.push(
      `Hi ${match.firstName}! I noticed we share the same faith. What values are most important to you?`,
    );
  }

  // Family values
  if (user.familyValues === match.familyValues) {
    starters.push(
      `Hey ${match.firstName}! It seems we share similar family values. How important is family to you in finding a life partner?`,
    );
  }

  // Generic interest starters
  const genericStarters = [
    `Hi ${match.firstName}! Your profile caught my attention. What are you looking for in a life partner?`,
    `Hello ${match.firstName}! I'd love to get to know you better. What does a typical weekend look like for you?`,
    `Hey ${match.firstName}! If you could travel anywhere in the world, where would you go first?`,
    `Hi ${match.firstName}! What's one thing on your bucket list that you'd like to accomplish this year?`,
    `Hello ${match.firstName}! Do you have any favorite books or shows you've been enjoying lately?`,
    `Hey ${match.firstName}! What's the best advice you've ever received about relationships?`,
    `Hi ${match.firstName}! If we could meet for coffee, what topic would you most want to discuss?`,
  ];

  // Add generic starters to fill up to 5 total
  while (starters.length < 5) {
    const starter = genericStarters[starters.length];
    if (starter) {
      starters.push(starter);
    } else {
      break;
    }
  }

  return starters.slice(0, 5);
}

/**
 * Generate icebreaker questions based on shared attributes.
 */
export function generateIcebreakers(
  user: UserProfile,
  match: MatchProfile
): string[] {
  const questions: string[] = [
    "What's the most meaningful conversation you've had recently?",
    "What qualities do you value most in a relationship?",
    "How do you envision your ideal family life?",
    "What's a tradition from your family that you'd like to carry forward?",
  ];

  if (user.hobbies.length > 0 && match.hobbies.length > 0) {
    questions.push("What's a hobby you've always wanted to try but haven't yet?");
  }

  if (user.country === match.country) {
    questions.push("What's your favorite local dish or restaurant?");
  }

  return questions.slice(0, 4);
}