/**
 * AI Bio Generator for Marriage Media profiles.
 * Generates professional, engaging bio text based on profile data.
 */

interface ProfileInfo {
  firstName: string;
  gender: string;
  age: number;
  profession: string;
  highestEducation: string;
  religion: string;
  hobbies: string[];
  familyValues: string;
  diet: string;
  aboutMe?: string;
  partnerPreference?: string;
  country: string;
  division?: string;
  maritalStatus: string;
  height?: string;
}

/**
 * Generate a bio for a user based on their profile information.
 * This is a rule-based generator. In production, integrate with OpenAI/Claude API.
 */
export function generateBio(profile: ProfileInfo): string {
  const sections: string[] = [];

  // Opening
  const greetings = [
    `Hi, I'm ${profile.firstName}`,
    `I'm ${profile.firstName}, a ${profile.age}-year-old ${profile.profession.toLowerCase()} based in ${profile.division || profile.country}`,
    `Hello! My name is ${profile.firstName} and I believe in building a meaningful connection`,
  ];
  sections.push(greetings[Math.floor(Math.random() * greetings.length)]);

  // Education & Career
  const careerPhrases = [
    `I'm a ${profile.profession} with a ${profile.highestEducation.toLowerCase()} background`,
    `Professionally, I work as a ${profile.profession} and hold a ${profile.highestEducation.toLowerCase()} degree`,
    `With my ${profile.highestEducation.toLowerCase()} qualification, I've built a career as a ${profile.profession}`,
  ];
  sections.push(careerPhrases[Math.floor(Math.random() * careerPhrases.length)]);

  // Lifestyle
  if (profile.hobbies.length > 0) {
    const hobbyList = profile.hobbies.slice(0, 4).join(", ").replace(/,([^,]*)$/, ", and$1");
    sections.push(`In my free time, I enjoy ${hobbyList}`);
  }

  // Values
  const valuesMap: Record<string, string> = {
    Traditional: "I come from a family that values tradition and cultural heritage",
    Moderate: "My family holds moderate values and believes in balancing modern and traditional perspectives",
    Liberal: "I grew up in a progressive family that values open-mindedness and individual choices",
    Orthodox: "I come from an orthodox family deeply rooted in our cultural and religious traditions",
    Secular: "My family embraces a secular outlook, respecting all beliefs and perspectives",
  };
  if (valuesMap[profile.familyValues]) {
    sections.push(valuesMap[profile.familyValues]);
  }

  // Diet
  if (profile.diet !== "No Preference") {
    sections.push(`I'm ${profile.diet.toLowerCase()} in my dietary preferences`);
  }

  // Religion
  sections.push(`My faith as a ${profile.religion.toLowerCase()} is an important part of my life`);

  // Partner expectations
  if (profile.partnerPreference) {
    sections.push(`I'm looking for a partner who ${profile.partnerPreference.toLowerCase().replace(/^i am looking for\s*/i, "").replace(/^i want\s*/i, "")}`);
  } else {
    sections.push("I'm looking for a life partner who shares similar values and is ready for a committed relationship");
  }

  // Closing
  const closings = [
    `If you think we could be a good match, I'd love to hear from you.`,
    `Feel free to reach out if you'd like to get to know me better.`,
    `Looking forward to connecting with someone special.`,
    `Let's start a conversation and see where it leads.`,
  ];
  sections.push(closings[Math.floor(Math.random() * closings.length)]);

  return sections.join(". ") + ".";
}

/**
 * Generate a short tagline for profile card display.
 */
export function generateTagline(profile: ProfileInfo): string {
  const parts = [
    profile.profession,
    `${profile.age}`,
    profile.division || profile.country,
  ];
  return parts.join(" · ");
}

/**
 * Generate partner preference suggestions based on profile.
 */
export function generatePartnerPreferenceSuggestions(
  profile: ProfileInfo
): string[] {
  const suggestions: string[] = [];

  const ageMin = Math.max(18, profile.age - 5);
  const ageMax = profile.age + 5;

  suggestions.push(
    `Someone between ${ageMin}-${ageMax} years of age with similar values`,
    `A ${profile.religion.toLowerCase()} partner who is ${profile.profession === "Doctor" ? "professionally driven" : "well-educated"}`
  );

  if (profile.hobbies.length > 0) {
    suggestions.push(
      `Someone who enjoys ${profile.hobbies.slice(0, 3).join(", ").toLowerCase()}`
    );
  }

  if (profile.familyValues === "Traditional" || profile.familyValues === "Orthodox") {
    suggestions.push("A partner who values family traditions and cultural heritage");
  } else {
    suggestions.push("A progressive and open-minded life partner");
  }

  suggestions.push(
    `Looking for a partner from ${profile.division || profile.country}`,
    "Someone who values honesty, respect, and mutual understanding"
  );

  return suggestions;
}