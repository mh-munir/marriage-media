export function getProfilePlaceholderImage(gender?: string): string {
  return gender?.trim().toLowerCase() === "female" ? "/images/female.png" : "/images/male.png";
}