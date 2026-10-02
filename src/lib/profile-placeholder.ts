export function getProfilePlaceholderImage(gender?: string): string {
  return gender?.trim().toLowerCase() === "female"
    ? "/images/female.png?v=2"
    : "/images/male.png?v=2";
}