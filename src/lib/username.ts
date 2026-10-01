const usernamePattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;

export function usernameProblem(username: string): string | null {
  const fits =
    username.length >= 3 && username.length <= 24 && usernamePattern.test(username);
  return fits ? null : 'Usernames are 3 to 24 letters or numbers, with single dashes between words';
}
